import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  normalizeDistributionInput,
  reviewDistributionInput,
  type DistributionInput,
  type DistributionReview,
} from "../actionGate/distributionCopilot";

export type JsonlParseResult<T> = {
  entries: T[];
  ignoredMalformed: number;
  missing: boolean;
};

export type ApprovalStatus =
  | "queued_for_approval"
  | "awaiting_approval"
  | "approved_for_manual_posting"
  | "rejected"
  | "needs_revision"
  | "escalated"
  | "ignored"
  | "saved_draft"
  | "manually_posted";

export type ApprovalHistoryEvent = {
  event: ApprovalStatus;
  at: string;
  note?: string;
};

export type ApprovalStateRecord = {
  id: string;
  status: ApprovalStatus;
  source?: string;
  actionType?: string;
  title?: string;
  decision?: string;
  riskLevel?: string;
  updatedAt: string;
  note?: string;
  history?: ApprovalHistoryEvent[];
};

export type DashboardApprovalState = {
  version: 1;
  updatedAt: string;
  items: Record<string, ApprovalStateRecord>;
  activity: DashboardActivityItem[];
};

export type DashboardActivityItem = {
  id: string;
  type:
    | "receipt"
    | "approval_state_changed"
    | "approval"
    | "workflow"
    | "blocked"
    | "policy"
    | "copilot";
  title: string;
  detail: string;
  description?: string;
  createdAt: string;
  at?: string;
  tone: "teal" | "green" | "amber" | "red" | "blue" | "purple";
};

export type DashboardOpportunity = {
  id: string;
  title: string;
  sourceType: string;
  platform: string;
  goal: string;
  age: string;
  sourceText: string;
  summary: string;
  whyItMatters: string[];
  relevanceScore: number;
  riskFlags: string[];
  riskLevel: "low" | "medium" | "high";
  decision: string;
  suggestedAction: string;
  safeComment?: string;
  safeRepost?: string;
  suggestedCTA?: string;
  whatNotToReveal: string[];
  workflowId?: string;
  receiptId?: string;
  logPath?: string;
  localStatus?: ApprovalStatus;
  isDemo: boolean;
};

export type DashboardReceipt = {
  id: string;
  timestamp: string;
  decision: string;
  riskLevel: string;
  actionType: string;
  source: string;
  workflowId?: string;
  logPath: string;
  raw: unknown;
  localStatus?: ApprovalStatus;
};

export type DashboardWorkflow = {
  workflowId: string;
  workflowName: string;
  currentStage: string;
  scopeStatus: string;
  cumulativeRisk: string;
  actions: number;
  lastUpdated: string;
  raw: unknown;
};

export type DashboardSnapshot = {
  generatedAt: string;
  isDemoData: boolean;
  parseWarnings: {
    ignoredMalformedJsonl: number;
    missingFiles: string[];
  };
  kpis: {
    opportunitiesFound: number;
    awaitingApproval: number;
    approvedToday: number;
    blocked: number;
    receiptsWritten: number;
  };
  opportunities: DashboardOpportunity[];
  approvals: DashboardOpportunity[];
  receipts: DashboardReceipt[];
  workflows: DashboardWorkflow[];
  activity: DashboardActivityItem[];
  approvalState: DashboardApprovalState;
};

type LoadOptions = {
  rootDir?: string;
};

const distributionDir = path.join(".aag", "distribution");
const workflowDir = path.join(".aag", "workflows");
const receiptDir = path.join(".aag", "receipts");
const inputDir = path.join("examples", "distribution-copilot", "inputs");
const approvalStatePath = path.join(distributionDir, "approval-state.json");

export function readJsonlFile<T>(
  filePath: string,
  parseEntry: (value: unknown) => T | undefined = (value) => value as T,
): JsonlParseResult<T> {
  if (!existsSync(filePath)) {
    return {
      entries: [],
      ignoredMalformed: 0,
      missing: true,
    };
  }

  const entries: T[] = [];
  let ignoredMalformed = 0;
  const lines = readFileSync(filePath, "utf8").split("\n");

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    try {
      const parsed = JSON.parse(line) as unknown;
      const entry = parseEntry(parsed);

      if (entry === undefined) {
        ignoredMalformed += 1;
      } else {
        entries.push(entry);
      }
    } catch {
      ignoredMalformed += 1;
    }
  }

  return {
    entries,
    ignoredMalformed,
    missing: false,
  };
}

export function loadDashboardSnapshot(
  approvalState: DashboardApprovalState,
  options: LoadOptions = {},
): DashboardSnapshot {
  const rootDir = options.rootDir ?? process.cwd();
  const missingFiles: string[] = [];
  let ignoredMalformedJsonl = 0;
  const distributionReceipts = readJsonlFile<DistributionReview>(
    resolve(rootDir, path.join(distributionDir, "receipts.jsonl")),
    parseDistributionReview,
  );
  const distributionOpportunities = readJsonlFile<Record<string, unknown>>(
    resolve(rootDir, path.join(distributionDir, "opportunities.jsonl")),
    parseRecord,
  );
  const distributionReviewPackets = readJsonlFile<Record<string, unknown>>(
    resolve(rootDir, path.join(distributionDir, "review-packets.jsonl")),
    parseRecord,
  );
  const workflowLedgers = readJsonlFile<Record<string, unknown>>(
    resolve(rootDir, path.join(workflowDir, "ledgers.jsonl")),
    parseRecord,
  );
  const workflowActions = readJsonlFile<Record<string, unknown>>(
    resolve(rootDir, path.join(workflowDir, "actions.jsonl")),
    parseRecord,
  );

  for (const result of [
    distributionReceipts,
    distributionOpportunities,
    distributionReviewPackets,
    workflowLedgers,
    workflowActions,
  ]) {
    ignoredMalformedJsonl += result.ignoredMalformed;
  }

  if (distributionReceipts.missing) {
    missingFiles.push(path.join(distributionDir, "receipts.jsonl"));
  }

  if (workflowLedgers.missing) {
    missingFiles.push(path.join(workflowDir, "ledgers.jsonl"));
  }

  const fileReceipts = loadReceiptFiles(rootDir);
  const inputOpportunities = loadInputOpportunities(rootDir);
  let opportunities = [
    ...distributionReceipts.entries.map((review, index) =>
      opportunityFromReview(review, `receipt-${index}`),
    ),
    ...distributionOpportunities.entries.map((entry, index) =>
      opportunityFromSummary(entry, `opportunity-${index}`),
    ),
    ...inputOpportunities,
  ];
  let receipts = [
    ...distributionReceipts.entries.map((review, index) =>
      receiptFromDistributionReview(review, index),
    ),
    ...fileReceipts,
  ];
  const workflows = latestWorkflows(workflowLedgers.entries);

  const hasRealData =
    opportunities.length > 0 || receipts.length > 0 || workflows.length > 0;

  if (!hasRealData) {
    const demo = createDemoSnapshot(approvalState);

    return {
      ...demo,
      parseWarnings: {
        ignoredMalformedJsonl,
        missingFiles,
      },
    };
  }

  opportunities = dedupeOpportunities(opportunities);
  receipts = dedupeReceipts(receipts);
  opportunities = opportunities.map((opportunity) =>
    attachOpportunityState(opportunity, approvalState),
  );
  receipts = receipts.map((receipt) => attachReceiptState(receipt, approvalState));

  const approvals = opportunities.filter((opportunity) =>
    isApprovalCandidate(opportunity, approvalState),
  );
  const activity = createActivity({
    opportunities,
    receipts,
    workflows,
    workflowActions: workflowActions.entries,
    reviewPackets: distributionReviewPackets.entries,
    approvalState,
  });

  return {
    generatedAt: new Date().toISOString(),
    isDemoData: false,
    parseWarnings: {
      ignoredMalformedJsonl,
      missingFiles,
    },
    kpis: createKpis(opportunities, approvals, receipts, approvalState),
    opportunities,
    approvals,
    receipts,
    workflows,
    activity,
    approvalState,
  };
}

export function createEmptyApprovalState(): DashboardApprovalState {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    items: {},
    activity: [],
  };
}

export function approvalStateFilePath(rootDir = process.cwd()): string {
  return resolve(rootDir, approvalStatePath);
}

function loadInputOpportunities(rootDir: string): DashboardOpportunity[] {
  const absoluteInputDir = resolve(rootDir, inputDir);

  if (!existsSync(absoluteInputDir)) {
    return [];
  }

  return readdirSync(absoluteInputDir)
    .filter((filename) => filename.endsWith(".json"))
    .map((filename) => {
      const filePath = path.join(absoluteInputDir, filename);

      try {
        const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
        const input = normalizeDistributionInput(parsed);
        const review = reviewDistributionInput(input, {
          createdAt: fileTimestampFallback(filename),
        });

        return opportunityFromReview(review, filename, input, filePath);
      } catch {
        return undefined;
      }
    })
    .filter((item): item is DashboardOpportunity => item !== undefined);
}

function opportunityFromReview(
  review: DistributionReview,
  seed: string,
  input?: DistributionInput,
  filePath?: string,
): DashboardOpportunity {
  const riskLevel = review.reviewPacket.riskLevel;
  const action = actionLabel(review.goal);

  return {
    id: review.sourceTextHash ?? seed,
    title: titleFromSource(input?.sourceText ?? review.summary, review.goal),
    sourceType: sourceType(review.platform, review.goal),
    platform: review.platform,
    goal: review.goal,
    age: ageFromTimestamp(review.createdAt),
    sourceText: input?.sourceText ?? review.summary,
    summary: review.summary,
    whyItMatters: review.whyItMattersToAAG,
    relevanceScore: review.relevanceScore,
    riskFlags: review.riskFlags,
    riskLevel,
    decision: review.decision,
    suggestedAction: action,
    safeComment: review.safeComment,
    safeRepost: review.safeRepost,
    suggestedCTA: review.suggestedCTA,
    whatNotToReveal: review.whatNotToReveal,
    workflowId: review.workflowId,
    receiptId: review.sourceTextHash,
    logPath: filePath
      ? relativeDisplayPath(filePath)
      : path.join(distributionDir, "receipts.jsonl"),
    isDemo: false,
  };
}

function receiptFromDistributionReview(
  review: DistributionReview,
  index: number,
): DashboardReceipt {
  return {
    id: review.sourceTextHash || `distribution-receipt-${index}`,
    timestamp: review.createdAt,
    decision: review.decision,
    riskLevel: review.reviewPacket.riskLevel,
    actionType: review.reviewPacket.proposedAction,
    source: review.platform,
    workflowId: review.workflowId,
    logPath: path.join(distributionDir, "receipts.jsonl"),
    raw: review,
  };
}

function opportunityFromSummary(
  entry: Record<string, unknown>,
  seed: string,
): DashboardOpportunity {
  const decision = String(entry.decision ?? "require_approval");
  const relevanceScore = Number(entry.relevanceScore ?? 1);
  const goal = String(entry.goal ?? "comment");
  const platform = String(entry.platform ?? "local");

  return {
    id: String(entry.sourceTextHash ?? seed),
    title: titleFromSource(String(entry.summary ?? "Local opportunity"), goal),
    sourceType: sourceType(platform, goal),
    platform,
    goal,
    age: ageFromTimestamp(String(entry.createdAt ?? "")),
    sourceText: String(entry.summary ?? "Local opportunity summary"),
    summary: String(entry.summary ?? "Local opportunity summary"),
    whyItMatters: ["Logged by the Distribution Copilot opportunity ledger"],
    relevanceScore,
    riskFlags: [],
    riskLevel:
      decision === "block" ? "high" : decision === "allow" ? "low" : "medium",
    decision,
    suggestedAction: actionLabel(goal),
    whatNotToReveal: [
      "MetaGate internals",
      "exact roadmap details",
      "claims that AAG prevented a specific incident",
    ],
    workflowId:
      typeof entry.workflowId === "string" ? entry.workflowId : undefined,
    receiptId:
      typeof entry.sourceTextHash === "string" ? entry.sourceTextHash : undefined,
    logPath: path.join(distributionDir, "opportunities.jsonl"),
    isDemo: false,
  };
}

function loadReceiptFiles(rootDir: string): DashboardReceipt[] {
  const absoluteReceiptDir = resolve(rootDir, receiptDir);

  if (!existsSync(absoluteReceiptDir)) {
    return [];
  }

  return readdirSync(absoluteReceiptDir)
    .filter((filename) => filename.endsWith(".json"))
    .map((filename) => {
      const filePath = path.join(absoluteReceiptDir, filename);

      try {
        const raw = JSON.parse(readFileSync(filePath, "utf8")) as Record<
          string,
          unknown
        >;

        return receiptFromRaw(raw, relativeDisplayPath(filePath));
      } catch {
        return undefined;
      }
    })
    .filter((item): item is DashboardReceipt => item !== undefined);
}

function receiptFromRaw(
  raw: Record<string, unknown>,
  logPath: string,
): DashboardReceipt {
  const proposedAction = parseRecord(raw.proposedAction);

  return {
    id:
      String(raw.configHash ?? raw.sourceTextHash ?? raw.receiptId ?? logPath),
    timestamp: String(raw.createdAt ?? raw.timestamp ?? ""),
    decision: String(raw.decision ?? raw.gateDecision ?? "unknown"),
    riskLevel: String(raw.riskLevel ?? "medium"),
    actionType: String(
      raw.actionType ?? proposedAction?.actionType ?? raw.command ?? "action",
    ),
    source: String(raw.command ?? proposedAction?.tool ?? "aag"),
    workflowId:
      typeof raw.workflowId === "string" ? raw.workflowId : undefined,
    logPath,
    raw,
  };
}

function latestWorkflows(entries: Record<string, unknown>[]): DashboardWorkflow[] {
  const byId = new Map<string, Record<string, unknown>>();

  for (const entry of entries) {
    const workflowId = String(entry.workflowId ?? "");

    if (workflowId) {
      byId.set(workflowId, entry);
    }
  }

  return Array.from(byId.values()).map((entry) => {
    const actions = Array.isArray(entry.actions) ? entry.actions.length : 0;

    return {
      workflowId: String(entry.workflowId ?? "wf_unknown"),
      workflowName: workflowName(String(entry.originalIntent ?? "")),
      currentStage: stageFromActions(actions, String(entry.scopeStatus ?? "")),
      scopeStatus: String(entry.scopeStatus ?? "in_scope"),
      cumulativeRisk: String(entry.cumulativeRisk ?? "low"),
      actions,
      lastUpdated: String(entry.updatedAt ?? entry.createdAt ?? ""),
      raw: entry,
    };
  });
}

function createKpis(
  opportunities: DashboardOpportunity[],
  approvals: DashboardOpportunity[],
  receipts: DashboardReceipt[],
  approvalState: DashboardApprovalState,
): DashboardSnapshot["kpis"] {
  const approvedToday = Object.values(approvalState.items).filter(
    (item) =>
      item.status === "approved_for_manual_posting" &&
      isToday(item.updatedAt),
  ).length;
  const queued = opportunities.filter((opportunity) => {
    const status = approvalState.items[opportunity.id]?.status;

    return status === "queued_for_approval" || status === "awaiting_approval";
  }).length;
  const pendingRequireApproval = opportunities.filter((opportunity) => {
    const status = approvalState.items[opportunity.id]?.status;

    return (
      opportunity.decision === "require_approval" &&
      status !== "approved_for_manual_posting" &&
      status !== "rejected" &&
      status !== "ignored" &&
      status !== "manually_posted"
    );
  }).length;

  return {
    opportunitiesFound: opportunities.length,
    awaitingApproval: Math.max(queued, pendingRequireApproval, approvals.length),
    approvedToday,
    blocked:
      opportunities.filter((opportunity) => opportunity.decision === "block")
        .length +
      Object.values(approvalState.items).filter(
        (item) => item.status === "rejected",
      ).length,
    receiptsWritten: receipts.length,
  };
}

function createActivity(input: {
  opportunities: DashboardOpportunity[];
  receipts: DashboardReceipt[];
  workflows: DashboardWorkflow[];
  workflowActions: Record<string, unknown>[];
  reviewPackets: Record<string, unknown>[];
  approvalState: DashboardApprovalState;
}): DashboardActivityItem[] {
  const receiptActivity = input.receipts.slice(0, 8).map((receipt) => ({
    id: `receipt-${receipt.id}`,
    type: "receipt" as const,
    title: "Receipt written",
    detail: `${receipt.actionType} returned ${receipt.decision}`,
    createdAt: receipt.timestamp || new Date().toISOString(),
    tone: toneForDecision(receipt.decision),
  }));
  const blockedActivity = input.opportunities
    .filter((opportunity) => opportunity.decision === "block")
    .slice(0, 4)
    .map((opportunity) => ({
      id: `blocked-${opportunity.id}`,
      type: "blocked" as const,
      title: "High risk post held for review",
      detail: opportunity.summary,
      createdAt: new Date().toISOString(),
      tone: "red" as const,
    }));
  const workflowActivity = input.workflows.slice(0, 5).map((workflow) => ({
    id: `workflow-${workflow.workflowId}`,
    type: "workflow" as const,
    title:
      workflow.scopeStatus === "scope_violation"
        ? "Workflow moved out of scope"
        : "Workflow moved in scope",
    detail: `${workflow.workflowName} is ${workflow.scopeStatus}`,
    createdAt: workflow.lastUpdated || new Date().toISOString(),
    tone:
      workflow.scopeStatus === "scope_violation"
        ? ("red" as const)
        : workflow.scopeStatus === "scope_warning"
          ? ("amber" as const)
          : ("blue" as const),
  }));
  const policyActivity = input.receipts
    .filter((receipt) => /metagate/i.test(receipt.actionType) || /metagate/i.test(receipt.source))
    .slice(0, 2)
    .map((receipt) => ({
      id: `policy-${receipt.id}`,
      type: "policy" as const,
      title: "MetaGate policy event logged",
      detail: `${receipt.actionType} returned ${receipt.decision}`,
      createdAt: receipt.timestamp || new Date().toISOString(),
      tone: toneForDecision(receipt.decision),
    }));
  const reviewPacketActivity = input.reviewPackets.slice(0, 5).map((packet, index) => ({
    id: `review-packet-${String(packet.sourceTextHash ?? index)}`,
    type: "copilot" as const,
    title: "Review packet written",
    detail: `Distribution review packet for ${String(packet.goal ?? "local opportunity")}`,
    createdAt: String(packet.createdAt ?? new Date().toISOString()),
    tone: "teal" as const,
  }));

  return [
    ...Object.values(input.approvalState.activity),
    ...reviewPacketActivity,
    ...policyActivity,
    ...blockedActivity,
    ...workflowActivity,
    ...receiptActivity,
  ]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, 40);
}

function createDemoSnapshot(
  approvalState: DashboardApprovalState,
): DashboardSnapshot {
  const demoOpportunity: DashboardOpportunity = {
    id: "demo-opportunity-1",
    title: "AI governance maturity debate in fintech",
    sourceType: "LinkedIn post",
    platform: "linkedin",
    goal: "comment",
    age: "28m",
    sourceText:
      "CISO shares challenges scaling AI governance across business units and asks how others are operationalizing oversight.",
    summary:
      "Demo LinkedIn comment opportunity scored 9/10: AI governance maturity debate in fintech.",
    whyItMatters: [
      "High alignment with governance and policy automation.",
      "Connects to runtime controls inside agentic workflows.",
    ],
    relevanceScore: 9,
    riskFlags: ["platform_risk", "needs_human_review"],
    riskLevel: "medium",
    decision: "require_approval",
    suggestedAction: "Comment",
    safeComment:
      "This is the shift I am seeing too. As AI systems move from chat to tools to agents, governance has to move closer to the point of action.",
    safeRepost:
      "Agentic AI changes the risk surface. The issue is no longer only whether a model gives a bad answer, but whether it influences or triggers a real action that should have required oversight.",
    suggestedCTA:
      "Invite a focused conversation about pre-execution oversight for agentic workflows.",
    whatNotToReveal: [
      "MetaGate internals",
      "exact roadmap details",
      "claims that AAG prevented a specific incident",
    ],
    isDemo: true,
  };

  return {
    generatedAt: new Date().toISOString(),
    isDemoData: true,
    parseWarnings: {
      ignoredMalformedJsonl: 0,
      missingFiles: [],
    },
    kpis: {
      opportunitiesFound: 1,
      awaitingApproval: 1,
      approvedToday: 0,
      blocked: 0,
      receiptsWritten: 0,
    },
    opportunities: [demoOpportunity],
    approvals: [demoOpportunity],
    receipts: [],
    workflows: [],
    activity: [
      {
        id: "demo-activity-1",
        type: "copilot",
        title: "Demo opportunity loaded",
        detail: "No local records found, so demo data is visible.",
        createdAt: new Date().toISOString(),
        tone: "teal",
      },
    ],
    approvalState,
  };
}

function isApprovalCandidate(
  opportunity: DashboardOpportunity,
  approvalState: DashboardApprovalState,
): boolean {
  const state = approvalState.items[opportunity.id];

  if (
    state &&
    (state.status === "queued_for_approval" ||
      state.status === "awaiting_approval" ||
      state.status === "needs_revision" ||
      state.status === "escalated" ||
      state.status === "approved_for_manual_posting")
  ) {
    return true;
  }

  if (
    state &&
    state.status !== "queued_for_approval" &&
    state.status !== "awaiting_approval" &&
    state.status !== "needs_revision" &&
    state.status !== "escalated"
  ) {
    return false;
  }

  return (
    opportunity.decision === "allow" ||
    opportunity.decision === "revise_action" ||
    opportunity.decision === "require_approval"
  );
}

function attachOpportunityState(
  opportunity: DashboardOpportunity,
  approvalState: DashboardApprovalState,
): DashboardOpportunity {
  const state = approvalState.items[opportunity.id];

  return {
    ...opportunity,
    ...(state ? { localStatus: state.status } : {}),
  };
}

function attachReceiptState(
  receipt: DashboardReceipt,
  approvalState: DashboardApprovalState,
): DashboardReceipt {
  const state =
    approvalState.items[receipt.id] ??
    Object.values(approvalState.items).find(
      (item) => item.id === receipt.id || item.id === String((receipt.raw as Record<string, unknown>)?.sourceTextHash ?? ""),
    );

  return {
    ...receipt,
    ...(state ? { localStatus: state.status } : {}),
  };
}

function dedupeOpportunities(
  opportunities: DashboardOpportunity[],
): DashboardOpportunity[] {
  const byId = new Map<string, DashboardOpportunity>();

  for (const opportunity of opportunities) {
    byId.set(opportunity.id, opportunity);
  }

  return Array.from(byId.values()).sort(
    (left, right) => right.relevanceScore - left.relevanceScore,
  );
}

function dedupeReceipts(receipts: DashboardReceipt[]): DashboardReceipt[] {
  const byId = new Map<string, DashboardReceipt>();

  for (const receipt of receipts) {
    byId.set(`${receipt.id}-${receipt.logPath}`, receipt);
  }

  return Array.from(byId.values()).sort(
    (left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp),
  );
}

function parseDistributionReview(value: unknown): DistributionReview | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const record = value as DistributionReview;

  return typeof record.decision === "string" &&
    typeof record.sourceTextHash === "string"
    ? record
    : undefined;
}

function parseRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function actionLabel(goal: string): string {
  switch (goal) {
    case "comment":
      return "Comment";
    case "repost":
      return "Repost";
    case "dm":
      return "Draft DM";
    case "original_post":
      return "Original Post";
    case "save_for_later":
      return "Save";
    default:
      return "Review";
  }
}

function sourceType(platform: string, goal: string): string {
  const formattedPlatform = formatPlatform(platform);

  return `${formattedPlatform} ${goal === "repost" ? "thread" : "post"}`;
}

function titleFromSource(sourceText: string, goal: string): string {
  const trimmed = sourceText.trim().replace(/\s+/g, " ");
  const sentence = trimmed.split(/[.!?]/)[0] ?? trimmed;
  const title = sentence.slice(0, 72);

  return title || `${actionLabel(goal)} opportunity`;
}

function workflowName(intent: string): string {
  if (!intent.trim()) {
    return "Local Workflow";
  }

  return intent.trim().replace(/\.$/, "").slice(0, 48);
}

function stageFromActions(actions: number, scopeStatus: string): string {
  if (scopeStatus === "scope_violation") {
    return "Blocked";
  }

  if (actions >= 4) {
    return "Approve";
  }

  if (actions >= 2) {
    return "Evaluate";
  }

  if (actions === 1) {
    return "Draft";
  }

  return "Discover";
}

function toneForDecision(
  decision: string,
): DashboardActivityItem["tone"] {
  if (decision === "block") {
    return "red";
  }

  if (decision === "require_approval" || decision === "revise_action") {
    return "amber";
  }

  if (decision === "allow") {
    return "green";
  }

  return "blue";
}

function isToday(timestamp: string): boolean {
  const date = new Date(timestamp);

  if (Number.isNaN(date.valueOf())) {
    return false;
  }

  return date.toDateString() === new Date().toDateString();
}

function ageFromTimestamp(timestamp: string): string {
  const time = Date.parse(timestamp);

  if (Number.isNaN(time)) {
    return "local";
  }

  const diffMs = Date.now() - time;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  return `${Math.floor(diffHours / 24)}d`;
}

function fileTimestampFallback(filename: string): string {
  const now = new Date();
  const offset =
    filename
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0) % 720;

  return new Date(now.getTime() - offset * 60000).toISOString();
}

function formatPlatform(platform: string): string {
  if (platform.toLowerCase() === "linkedin") {
    return "LinkedIn";
  }

  return platform
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function relativeDisplayPath(filePath: string): string {
  return path.relative(process.cwd(), filePath).replace(/\\/g, "/");
}

function resolve(rootDir: string, filePath: string): string {
  return path.resolve(rootDir, filePath);
}
