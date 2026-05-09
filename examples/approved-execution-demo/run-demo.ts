import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  buildDefaultAuthorityMap,
  evaluateApprovalAuthority,
  type ApprovalAuthorityInput,
} from "../../src/actionGate/approvalAuthority";
import { evaluateAction } from "../../src/actionGate/evaluateAction";
import { writeEvaluationReceipt } from "../../src/actionGate/writeReceipt";
import type { ActionGateInput, ActionGateResult } from "../../src/actionGate/types";

type ApprovedActionFile = ActionGateInput & {
  approvedBy?: string;
  approvalAuthority?: ApprovalAuthorityInput;
};

const demoDir = path.resolve("examples", "approved-execution-demo");
const proposedActionPath = path.join(demoDir, "proposed-action.json");
const approvedActionPath = path.join(demoDir, "approved-action.json");
const executionLogPath = path.resolve(
  ".aag",
  "demo-executions",
  "approved-execution-demo.jsonl",
);

function main(): void {
  console.log("AAG Approved Execution Demo");
  console.log("");

  const proposedInput = readActionFile<ActionGateInput>(proposedActionPath);
  const proposedResult = evaluateAction(proposedInput);

  console.log("Step 1 - Evaluate Proposed Action");
  printDecision(proposedResult);
  if (proposedResult.decision !== "require_approval") {
    throw new Error(
      `Expected proposed action to require approval, got ${proposedResult.decision}.`,
    );
  }

  console.log("");
  console.log("Step 2 - Local Review Packet");
  printReviewPacket(proposedInput, proposedResult);

  console.log("");
  console.log("Step 3 - Simulated Local Human Approval");
  const approvedInput = readActionFile<ApprovedActionFile>(approvedActionPath);
  const approvedBy = approvedInput.approvedBy ?? "local-founder";
  console.log(`Approved by: ${approvedBy}`);
  console.log("Approval mode: local simulation only");

  console.log("");
  console.log("Step 4 - Re-evaluate Approved Action");
  const approvedResult = evaluateAction(approvedInput);
  printDecision(approvedResult);

  const authorityInput = buildAuthorityInput(approvedInput, approvedResult);
  const authority = evaluateApprovalAuthority(
    authorityInput,
    authorityInput.authorityMap ?? buildDefaultAuthorityMap(),
  );
  console.log("Approval Authority:");
  console.log(JSON.stringify(authority, null, 2));

  console.log("");
  console.log("Step 5 - Simulated Execution");
  if (!canSimulateExecution(proposedResult, approvedResult, authority)) {
    throw new Error("Approved execution demo stopped before simulated execution.");
  }

  const executionRecord = writeExecutionRecord(approvedInput, approvedBy);
  console.log(`Simulated execution record written: ${formatPath(executionLogPath)}`);
  console.log(JSON.stringify(executionRecord, null, 2));

  console.log("");
  console.log("Step 6 - AAG Execution Receipt");
  const receiptPath = writeEvaluationReceipt({
    command: "evaluate",
    input: approvedInput,
    result: approvedResult,
    reason:
      "Approved execution demo re-evaluated the action after local human approval and simulated execution locally.",
    humanDecision: "approved",
    finalOutcome: "simulated_execution_after_approval",
    sourceFile: formatPath(approvedActionPath),
    approvalAuthority: authorityInput,
  });
  console.log(`Receipt written: ${formatPath(receiptPath)}`);

  console.log("");
  console.log("Step 7 - Local Verification Commands");
  console.log("npx . verify-receipts");
  console.log("npx . policy-provenance");
  console.log("npx . authority-map");
}

function readActionFile<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function printDecision(result: ActionGateResult): void {
  console.log(`Decision: ${result.decision}`);
  console.log(`Risk level: ${result.riskLevel}`);
  console.log(`Recommended action: ${result.recommendedAction}`);
}

function printReviewPacket(
  input: ActionGateInput,
  result: ActionGateResult,
): void {
  console.log(`Proposed action: ${result.reviewPacket?.proposedAction ?? input.proposedAction.actionType}`);
  console.log(`Target: ${input.proposedAction.target ?? "unknown"}`);
  console.log(`Risk level: ${result.riskLevel}`);
  console.log(
    `Approval question: ${
      result.reviewPacket?.reviewerQuestion ??
      "Do you approve this exact action with this scope and consequence?"
    }`,
  );
  console.log("Exact payload preview:");
  console.log(JSON.stringify(input.proposedAction.payload ?? {}, null, 2));
}

function buildAuthorityInput(
  input: ApprovedActionFile,
  result: ActionGateResult,
): ApprovalAuthorityInput {
  return {
    authorityId:
      input.approvalAuthority?.authorityId ?? input.approvedBy ?? "local-founder",
    actionType: input.proposedAction.actionType,
    target: input.proposedAction.target,
    riskLevel: result.riskLevel,
    scope: input.approvalAuthority?.scope ?? "distribution",
    irreversible: false,
    externalPosting: false,
    secondApprovalPresent: false,
    notes: [
      ...(input.approvalAuthority?.notes ?? []),
      "Execution was simulated locally; no social API call was made.",
    ],
  };
}

function canSimulateExecution(
  proposedResult: ActionGateResult,
  approvedResult: ActionGateResult,
  authority: { authorityDecision: string; authorityValidAtDecision: boolean },
): boolean {
  const locallyApproved =
    proposedResult.decision === "require_approval" &&
    approvedResult.decision === "allow";

  return locallyApproved && authority.authorityDecision === "valid" && authority.authorityValidAtDecision;
}

function writeExecutionRecord(input: ApprovedActionFile, approvedBy: string) {
  const createdAt = new Date().toISOString();
  const executionRecord = {
    executionId: `approved-execution-demo-${createdAt.replace(/[:.]/g, "-")}`,
    createdAt,
    workflowId: input.context?.workflowId ?? "wf_approved_execution_demo",
    actionType: input.proposedAction.actionType,
    target: input.proposedAction.target,
    approvedBy,
    simulated: true,
    executed: true,
    payloadPreview: input.proposedAction.payload ?? {},
    note: "No external API call was made. This is a local simulated execution.",
  };

  mkdirSync(path.dirname(executionLogPath), { recursive: true });
  appendFileSync(executionLogPath, `${JSON.stringify(executionRecord)}\n`, "utf8");

  return executionRecord;
}

function formatPath(filePath: string): string {
  return path.relative(process.cwd(), filePath).replace(/\\/g, "/");
}

main();
