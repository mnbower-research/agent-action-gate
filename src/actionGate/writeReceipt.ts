import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  ActionGateInput,
  ActionGateResult,
  GateDecision,
  PolicyProfileResultMetadata,
  ReviewPacket,
} from "./types";

export const defaultReceiptDirectory = path.join(".aag", "receipts");

export type HumanDecision = "approved" | "not_required" | "not_requested";

export type FinalOutcome =
  | "simulated_execution"
  | "simulated_execution_after_approval"
  | "stopped_by_gate"
  | "needs_revision"
  | "not_executed";

type EvaluationReceiptParams = {
  command: "evaluate";
  input: ActionGateInput;
  result: ActionGateResult;
  reason: string;
  humanDecision: HumanDecision;
  finalOutcome: FinalOutcome;
  sourceFile?: string;
  receiptDirectory?: string;
};

type DemoReceiptParams = {
  command: "demo";
  policyProfile: PolicyProfileResultMetadata;
  summary: Record<GateDecision, number> & {
    total: number;
    matchedExpected: number;
  };
  actions: DemoReceiptAction[];
  receiptDirectory?: string;
};

export type DemoReceiptAction = {
  timestamp: string;
  proposedAction: {
    id: string;
    title: string;
    proposedBy: string;
    actionType: string;
    target: string;
  };
  gateDecision: GateDecision;
  reason: string;
  primaryIssue: ActionGateResult["primaryIssue"];
  policyProfile?: PolicyProfileResultMetadata;
  reviewPacket?: ReviewPacket;
  finalOutcome: FinalOutcome;
  humanDecision: HumanDecision;
};

export function writeEvaluationReceipt(params: EvaluationReceiptParams): string {
  const timestamp = new Date().toISOString();
  const receipt = {
    timestamp,
    command: params.command,
    policyProfile: params.result.policyProfile,
    proposedAction: summarizeAction(params.input),
    gateDecision: params.result.decision,
    reason: params.reason,
    primaryIssue: params.result.primaryIssue,
    policyMetadata: params.result.policyProfile,
    reviewPacket: params.result.reviewPacket,
    finalOutcome: params.finalOutcome,
    humanDecision: params.humanDecision,
    sourceFile: params.sourceFile,
  };
  const filename = `${toFilenameTimestamp(timestamp)}-${safeSegment(
    params.input.proposedAction.actionType,
  )}.json`;

  return writeJsonReceipt(receipt, filename, params.receiptDirectory);
}

export function writeDemoReceipt(params: DemoReceiptParams): string {
  const timestamp = new Date().toISOString();
  const receipt = {
    timestamp,
    command: params.command,
    policyProfile: params.policyProfile,
    proposedAction: {
      title: "Launch Copilot demo",
      actionType: "launch_copilot_demo",
    },
    gateDecision: "allow" as GateDecision,
    reason: "Launch Copilot demo evaluated all sample actions.",
    primaryIssue: null,
    policyMetadata: params.policyProfile,
    reviewPacket: undefined,
    finalOutcome:
      params.summary.matchedExpected === params.summary.total
        ? "simulated_execution"
        : "needs_revision",
    humanDecision: "not_required",
    summary: params.summary,
    actions: params.actions,
  };
  const filename = `${toFilenameTimestamp(timestamp)}-launch-copilot-demo.json`;

  return writeJsonReceipt(receipt, filename, params.receiptDirectory);
}

function writeJsonReceipt(
  receipt: unknown,
  filename: string,
  receiptDirectory = defaultReceiptDirectory,
): string {
  mkdirSync(receiptDirectory, { recursive: true });

  const receiptPath = path.join(receiptDirectory, filename);
  writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");

  return receiptPath;
}

function summarizeAction(input: ActionGateInput): Record<string, unknown> {
  return {
    tool: input.proposedAction.tool,
    actionType: input.proposedAction.actionType,
    target: input.proposedAction.target,
    reversible: input.proposedAction.reversible,
    externalFacing: input.proposedAction.externalFacing,
  };
}

function toFilenameTimestamp(timestamp: string): string {
  return timestamp.replace(/[:.]/g, "-");
}

function safeSegment(value: string | undefined): string {
  if (!value) {
    return "action";
  }

  const segment = value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return segment || "action";
}
