import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { sha256Stable } from "../actionGate/stableHash";
import {
  approvalStateFilePath,
  createEmptyApprovalState,
  type ApprovalStatus,
  type DashboardActivityItem,
  type DashboardApprovalState,
  type DashboardOpportunity,
} from "./dashboardData";

export function loadApprovalState(rootDir = process.cwd()): DashboardApprovalState {
  const filePath = approvalStateFilePath(rootDir);

  if (!existsSync(filePath)) {
    return createEmptyApprovalState();
  }

  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;

    if (isApprovalState(parsed)) {
      return parsed;
    }
  } catch {
    // Malformed dashboard state should not stop local dashboard rendering.
  }

  return createEmptyApprovalState();
}

export function saveApprovalState(
  state: DashboardApprovalState,
  rootDir = process.cwd(),
): string {
  const filePath = approvalStateFilePath(rootDir);

  mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp`;

  writeFileSync(tempPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  renameSync(tempPath, filePath);

  return filePath;
}

export function updateApprovalState(
  state: DashboardApprovalState,
  input: {
    itemId: string;
    status: ApprovalStatus;
    note?: string;
    opportunity?: DashboardOpportunity;
  },
): DashboardApprovalState {
  validateApprovalStatus(input.status);

  if (!input.itemId.trim()) {
    throw new Error("itemId is required.");
  }

  const updatedAt = new Date().toISOString();
  const existing = state.items[input.itemId];
  const historyEvent = {
    event: input.status,
    at: updatedAt,
    ...(input.note ? { note: input.note } : {}),
  };
  const previousHistory = existing?.history ?? [];
  const lastHistory = previousHistory[previousHistory.length - 1];
  const didAlreadyRecordStatus =
    existing?.status === input.status && lastHistory?.event === input.status;
  const nextHistory = didAlreadyRecordStatus
    ? previousHistory
    : [...previousHistory, historyEvent];
  const record = {
    ...(existing ?? {}),
    id: input.itemId,
    status: input.status,
    ...(input.opportunity
      ? {
          source: input.opportunity.platform,
          actionType: actionTypeForOpportunity(input.opportunity),
          title: input.opportunity.title,
          decision: input.opportunity.decision,
          riskLevel: input.opportunity.riskLevel,
        }
      : {}),
    updatedAt,
    ...(input.note ? { note: input.note } : {}),
    history: nextHistory,
  };
  const activity = createActivity(input.itemId, input.status, updatedAt, input.note);
  const nextActivity = didAlreadyRecordStatus
    ? state.activity
    : [activity, ...state.activity].slice(0, 100);

  return {
    version: 1,
    updatedAt,
    items: {
      ...state.items,
      [input.itemId]: record,
    },
    activity: nextActivity,
  };
}

export function markManuallyPosted(
  state: DashboardApprovalState,
  input: {
    itemId: string;
    opportunity?: DashboardOpportunity;
  },
): DashboardApprovalState {
  const existing = state.items[input.itemId];

  if (existing?.status !== "approved_for_manual_posting") {
    throw new Error("Item must be approved_for_manual_posting before it can be marked manually posted.");
  }

  return updateApprovalState(state, {
    itemId: input.itemId,
    status: "manually_posted",
    note: "Marked manually posted. No public action was taken by AAG.",
    ...(input.opportunity ? { opportunity: input.opportunity } : {}),
  });
}

function createActivity(
  itemId: string,
  status: ApprovalStatus,
  updatedAt: string,
  note: string | undefined,
): DashboardActivityItem {
  return {
    id: createActivityId(itemId, status, updatedAt),
    type: "approval_state_changed",
    title: approvalTitle(status),
    detail: note ?? `Local approval state set to ${status}. No public action was taken.`,
    description: note ?? `Local approval state set to ${status}. No public action was taken.`,
    createdAt: updatedAt,
    at: updatedAt,
    tone: toneForStatus(status),
  };
}

export function validateApprovalStatus(status: string): asserts status is ApprovalStatus {
  if (
    status !== "queued_for_approval" &&
    status !== "awaiting_approval" &&
    status !== "approved_for_manual_posting" &&
    status !== "rejected" &&
    status !== "needs_revision" &&
    status !== "escalated" &&
    status !== "ignored" &&
    status !== "saved_draft" &&
    status !== "manually_posted"
  ) {
    throw new Error(`Unsupported approval status: ${status}`);
  }
}

function isApprovalState(value: unknown): value is DashboardApprovalState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as DashboardApprovalState;

  return record.version === 1 && typeof record.items === "object";
}

function approvalTitle(status: ApprovalStatus): string {
  switch (status) {
    case "queued_for_approval":
      return "Queued for approval";
    case "approved_for_manual_posting":
      return "Approved for manual posting";
    case "rejected":
      return "Approval rejected";
    case "needs_revision":
      return "Revision requested";
    case "escalated":
      return "Review escalated";
    case "ignored":
      return "Opportunity ignored";
    case "saved_draft":
      return "Draft saved";
    case "manually_posted":
      return "Marked manually posted";
    case "awaiting_approval":
      return "Queued for approval";
  }
}

function toneForStatus(status: ApprovalStatus): DashboardActivityItem["tone"] {
  switch (status) {
    case "queued_for_approval":
      return "amber";
    case "approved_for_manual_posting":
      return "green";
    case "rejected":
      return "red";
    case "needs_revision":
      return "blue";
    case "escalated":
      return "purple";
    case "ignored":
      return "amber";
    case "saved_draft":
      return "teal";
    case "manually_posted":
      return "green";
    case "awaiting_approval":
      return "amber";
  }
}

function createActivityId(itemId: string, status: ApprovalStatus, updatedAt: string): string {
  return `act_${sha256Stable({ itemId, status, updatedAt }).slice(7, 19)}`;
}

function actionTypeForOpportunity(opportunity: DashboardOpportunity): string {
  switch (opportunity.goal) {
    case "comment":
      return "comment_on_post";
    case "repost":
      return "repost_with_comment";
    case "dm":
      return "draft_dm";
    case "original_post":
      return "draft_original_post";
    case "save_for_later":
      return "save_opportunity";
    default:
      return opportunity.goal;
  }
}
