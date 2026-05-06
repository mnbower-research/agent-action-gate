import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  createEffectiveAagConfig,
  defaultReceiptDirectory,
  receiptVersion,
} from "./aagConfig";
import { actionGateDetectors } from "./evaluateAction";
import { defaultPolicyProfile, getPolicyProfileById } from "./policyProfiles";
import { sha256Stable } from "./stableHash";
import type {
  ActionGateInput,
  ActionGateResult,
  GateDecision,
  PolicyProfile,
  PolicyProfileResultMetadata,
  ReviewPacket,
} from "./types";

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
  policyProfile?: PolicyProfile;
  receiptDirectory?: string;
};

type DemoReceiptParams = {
  command: "demo";
  policyProfile: PolicyProfile;
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
  const createdAt = new Date().toISOString();
  const effectivePolicyProfile = getEffectivePolicyProfile(
    params.input,
    params.policyProfile,
  );
  const configHash = getConfigHash(params.receiptDirectory);
  const policyHash = sha256Stable(effectivePolicyProfile);
  const receipt = {
    receiptVersion,
    createdAt,
    timestamp: createdAt,
    configHash,
    policyHash,
    command: params.command,
    policyProfile: params.result.policyProfile,
    proposedAction: summarizeAction(params.input),
    decision: params.result.decision,
    gateDecision: params.result.decision,
    reason: params.reason,
    primaryIssue: params.result.primaryIssue,
    policyMetadata: params.result.policyProfile,
    reviewPacket: params.result.reviewPacket,
    finalOutcome: params.finalOutcome,
    humanDecision: params.humanDecision,
    sourceFile: params.sourceFile,
  };
  const filename = `${toFilenameTimestamp(createdAt)}-${safeSegment(
    params.input.proposedAction.actionType,
  )}.json`;

  return writeJsonReceipt(receipt, filename, params.receiptDirectory);
}

export function writeDemoReceipt(params: DemoReceiptParams): string {
  const createdAt = new Date().toISOString();
  const policyMetadata: PolicyProfileResultMetadata = {
    id: params.policyProfile.id,
    name: params.policyProfile.name,
  };
  const configHash = getConfigHash(params.receiptDirectory);
  const policyHash = sha256Stable(params.policyProfile);
  const receipt = {
    receiptVersion,
    createdAt,
    timestamp: createdAt,
    configHash,
    policyHash,
    command: params.command,
    policyProfile: policyMetadata,
    proposedAction: {
      title: "Launch Copilot demo",
      actionType: "launch_copilot_demo",
    },
    decision: "allow" as GateDecision,
    gateDecision: "allow" as GateDecision,
    reason: "Launch Copilot demo evaluated all sample actions.",
    primaryIssue: null,
    policyMetadata,
    reviewPacket: undefined,
    finalOutcome:
      params.summary.matchedExpected === params.summary.total
        ? "simulated_execution"
        : "needs_revision",
    humanDecision: "not_required",
    summary: params.summary,
    actions: params.actions,
  };
  const filename = `${toFilenameTimestamp(createdAt)}-launch-copilot-demo.json`;

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

function getConfigHash(receiptDirectory: string | undefined): string {
  return sha256Stable(
    createEffectiveAagConfig({
      receiptDirectory,
      detectorIds: actionGateDetectors.map((detector) => detector.name),
    }),
  );
}

function getEffectivePolicyProfile(
  input: ActionGateInput,
  policyProfile: PolicyProfile | undefined,
): PolicyProfile {
  return (
    policyProfile ??
    input.policyProfile ??
    getPolicyProfileById(input.policyProfileId) ??
    defaultPolicyProfile
  );
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
