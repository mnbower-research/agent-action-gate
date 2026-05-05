import { readFileSync } from "node:fs";
import path from "node:path";
import { evaluateAction } from "../../src/actionGate/evaluateAction";
import type {
  ActionGateInput,
  ActionGateResult,
  GateDecision,
  ReviewPacket,
} from "../../src/actionGate/types";

type DataSensitivity = "low" | "medium" | "high";
type HumanDecision = "approved" | "not_required" | "not_requested";
type FinalOutcome =
  | "simulated_execution"
  | "simulated_execution_after_approval"
  | "stopped_by_gate"
  | "needs_revision";

type LaunchAction = {
  id: string;
  title: string;
  proposedBy: string;
  tool: string;
  actionType: string;
  target: string;
  description: string;
  externalEffect: boolean;
  reversible: boolean;
  dataSensitivity: DataSensitivity;
  expectedDecision: GateDecision;
  rationale: string;
  payload: Record<string, unknown>;
  reviewPacket?: ReviewPacket;
};

type DemoResult = {
  id: string;
  title: string;
  actionType: string;
  expectedDecision: GateDecision;
  actualDecision: GateDecision;
  pass: boolean;
  reason: string;
  humanDecision: HumanDecision;
  finalOutcome: FinalOutcome;
  primaryIssue: ActionGateResult["primaryIssue"];
  reviewPacket?: ReviewPacket;
};

type AuditLogEntry = {
  timestamp: string;
  proposedAction: {
    id: string;
    title: string;
    proposedBy: string;
    actionType: string;
    target: string;
  };
  gateDecision: GateDecision;
  humanDecision: HumanDecision;
  finalOutcome: FinalOutcome;
  primaryIssue: ActionGateResult["primaryIssue"];
  reason: string;
  reviewPacket?: ReviewPacket;
};

const demoName = "Launch Copilot Demo";
const version = "0.6.0";
const actionsPath = path.join(
  process.cwd(),
  "examples",
  "launch-copilot",
  "actions.json",
);

const actions = loadActions(actionsPath);
const results: DemoResult[] = [];
const auditLog: AuditLogEntry[] = [];
const summary: Record<GateDecision, number> = {
  allow: 0,
  require_approval: 0,
  revise_action: 0,
  block: 0,
};

console.log(demoName);
console.log(`Version: ${version}`);
console.log("====================");
console.log("");

actions.forEach((action, index) => {
  const gateInput = toActionGateInput(action);
  const gateResult = evaluateAction(gateInput);
  const reviewPacket = action.reviewPacket ?? gateResult.reviewPacket;
  const humanDecision = getHumanDecision(gateResult.decision);
  const finalOutcome = getFinalOutcome(gateResult.decision, humanDecision);
  const pass = gateResult.decision === action.expectedDecision;

  summary[gateResult.decision] += 1;

  const demoResult: DemoResult = {
    id: action.id,
    title: action.title,
    actionType: action.actionType,
    expectedDecision: action.expectedDecision,
    actualDecision: gateResult.decision,
    pass,
    reason: action.rationale,
    humanDecision,
    finalOutcome,
    primaryIssue: gateResult.primaryIssue,
    reviewPacket,
  };

  results.push(demoResult);
  auditLog.push(
    toAuditLogEntry(action, gateResult, humanDecision, finalOutcome, reviewPacket),
  );

  printActionResult(index + 1, demoResult);
});

const matchedExpected = results.filter((result) => result.pass).length;

console.log("Summary:");
console.log(`${actions.length} actions evaluated`);
console.log(`${summary.allow} allowed`);
console.log(`${summary.require_approval} required approval`);
console.log(`${summary.revise_action} revised`);
console.log(`${summary.block} blocked`);
console.log(`${matchedExpected}/${actions.length} matched expected decisions`);
console.log("");
console.log("Audit log entries:");
console.log(JSON.stringify(auditLog, null, 2));

if (matchedExpected !== actions.length) {
  process.exitCode = 1;
}

function loadActions(filePath: string): LaunchAction[] {
  const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));

  if (!Array.isArray(parsed) || !parsed.every(isLaunchAction)) {
    throw new Error("examples/launch-copilot/actions.json has an invalid shape.");
  }

  return parsed;
}

function isLaunchAction(value: unknown): value is LaunchAction {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.proposedBy === "string" &&
    typeof value.tool === "string" &&
    typeof value.actionType === "string" &&
    typeof value.target === "string" &&
    typeof value.description === "string" &&
    typeof value.externalEffect === "boolean" &&
    typeof value.reversible === "boolean" &&
    isDataSensitivity(value.dataSensitivity) &&
    isGateDecision(value.expectedDecision) &&
    typeof value.rationale === "string" &&
    isRecord(value.payload) &&
    (value.reviewPacket === undefined || isReviewPacket(value.reviewPacket))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDataSensitivity(value: unknown): value is DataSensitivity {
  return value === "low" || value === "medium" || value === "high";
}

function isGateDecision(value: unknown): value is GateDecision {
  return (
    value === "allow" ||
    value === "require_approval" ||
    value === "revise_action" ||
    value === "block"
  );
}

function isReviewPacket(value: unknown): value is ReviewPacket {
  return (
    isRecord(value) &&
    typeof value.proposedAction === "string" &&
    typeof value.riskReason === "string" &&
    typeof value.reviewerQuestion === "string"
  );
}

function toActionGateInput(action: LaunchAction): ActionGateInput {
  return {
    userRequest: `Govern this Launch Copilot business action: ${action.description}`,
    agentPlan:
      "Propose launch workflow actions, but let Agent Action Gate decide whether execution is allowed.",
    proposedAction: {
      tool: action.tool,
      actionType: action.actionType,
      target: action.target,
      payload: action.payload,
      reversible: action.reversible,
      externalFacing: action.externalEffect,
    },
    sourceProfile: {
      systemObjective:
        "Support business launch work without bypassing meaningful human oversight.",
      approvalRequiredFor: [
        "external",
        "public",
        "send",
        "publish",
        "export",
        "delete",
      ],
      nonNegotiables: [
        "Do not delete lead records without special approval.",
        "Do not expose private lead data or PII.",
      ],
    },
    context: {
      userApproved: false,
      environment: action.externalEffect ? "production" : "dev",
      workflowId: "launch-copilot-demo",
      authorizedTargets: ["local_draft", "local_lead_record"],
      authorizedActionTypes: ["draft_private_outreach", "add_lead_note"],
    },
  };
}

function getHumanDecision(decision: GateDecision): HumanDecision {
  if (decision === "require_approval") {
    return "approved";
  }

  if (decision === "allow") {
    return "not_required";
  }

  return "not_requested";
}

function getFinalOutcome(
  decision: GateDecision,
  humanDecision: HumanDecision,
): FinalOutcome {
  if (decision === "allow") {
    return "simulated_execution";
  }

  if (decision === "require_approval" && humanDecision === "approved") {
    return "simulated_execution_after_approval";
  }

  if (decision === "revise_action") {
    return "needs_revision";
  }

  return "stopped_by_gate";
}

function toAuditLogEntry(
  action: LaunchAction,
  gateResult: ActionGateResult,
  humanDecision: HumanDecision,
  finalOutcome: FinalOutcome,
  reviewPacket: ReviewPacket | undefined,
): AuditLogEntry {
  return {
    timestamp: new Date().toISOString(),
    proposedAction: {
      id: action.id,
      title: action.title,
      proposedBy: action.proposedBy,
      actionType: action.actionType,
      target: action.target,
    },
    gateDecision: gateResult.decision,
    humanDecision,
    finalOutcome,
    primaryIssue: gateResult.primaryIssue,
    reason: action.rationale,
    reviewPacket,
  };
}

function printActionResult(index: number, result: DemoResult): void {
  console.log(`${index}. Action: ${result.title}`);
  console.log(`Expected decision: ${result.expectedDecision}`);
  console.log(`Actual decision: ${result.actualDecision}`);

  if (result.actualDecision === "require_approval") {
    console.log(`Human review: ${result.humanDecision}`);
  }

  console.log(`Result: ${result.pass ? "PASS" : "FAIL"}`);
  console.log(`Reason: ${result.reason}`);

  if (result.reviewPacket) {
    printReviewPacket(result.reviewPacket);
  }

  console.log("");
}

function printReviewPacket(reviewPacket: ReviewPacket): void {
  console.log("Review Packet:");
  console.log(`Proposed action: ${reviewPacket.proposedAction}`);

  if (reviewPacket.scope) {
    console.log(`Scope: ${formatScope(reviewPacket.scope)}`);
  }

  if (reviewPacket.diffPreview) {
    console.log("Diff / Preview:");
    printDiffPreview(reviewPacket.diffPreview);
  }

  if (reviewPacket.rollbackPath) {
    console.log(
      `Rollback: ${reviewPacket.rollbackPath.description} available=${reviewPacket.rollbackPath.available}`,
    );
  }

  console.log(`Risk: ${reviewPacket.riskReason}`);
  console.log(`Reviewer question: ${reviewPacket.reviewerQuestion}`);

  if (reviewPacket.saferAlternative) {
    console.log(`Safer alternative: ${reviewPacket.saferAlternative}`);
  }
}

function formatScope(scope: NonNullable<ReviewPacket["scope"]>): string {
  const parts = [
    scope.target ? `target=${scope.target}` : undefined,
    scope.affectedSystems?.length
      ? `systems=${scope.affectedSystems.join(", ")}`
      : undefined,
    scope.affectedRecords?.length
      ? `records=${scope.affectedRecords.join(", ")}`
      : undefined,
    scope.externalEffect !== undefined
      ? `externalEffect=${scope.externalEffect}`
      : undefined,
    scope.dataSensitivity ? `dataSensitivity=${scope.dataSensitivity}` : undefined,
    scope.blastRadius ? `blastRadius=${scope.blastRadius}` : undefined,
  ].filter(Boolean);

  return parts.join("; ");
}

function printDiffPreview(
  diffPreview: NonNullable<ReviewPacket["diffPreview"]>,
): void {
  console.log(`Type: ${diffPreview.type}`);

  if (diffPreview.before !== undefined) {
    console.log(`Before: ${JSON.stringify(diffPreview.before, null, 2)}`);
  }

  if (diffPreview.after !== undefined) {
    console.log(`After: ${JSON.stringify(diffPreview.after, null, 2)}`);
  }

  if (diffPreview.preview) {
    console.log(diffPreview.preview);
  }
}
