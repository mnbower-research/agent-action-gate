#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { auditReceipts } from "./actionGate/auditReceipts";
import { evaluateAction } from "./actionGate/evaluateAction";
import { formatAuditReport } from "./actionGate/formatAuditReport";
import { printReviewPacket } from "./actionGate/formatReviewPacket";
import { runLaunchCopilotDemo } from "./actionGate/launchCopilotDemo";
import {
  builtInPolicyProfiles,
  getPolicyProfileById,
} from "./actionGate/policyProfiles";
import type { ActionGateInput } from "./actionGate/types";
import {
  type FinalOutcome,
  type HumanDecision,
  writeEvaluationReceipt,
} from "./actionGate/writeReceipt";

const cliVersion = "0.9.0";

type CliActionFile = {
  id?: string;
  title?: string;
  proposedBy?: string;
  actionType: string;
  target?: string;
  description?: string;
  externalEffect?: boolean;
  reversible?: boolean;
  dataSensitivity?: "low" | "medium" | "high";
  tool: string;
  payload?: Record<string, unknown>;
};

type LoadedAction = {
  input: ActionGateInput;
  displayName: string;
};

const exitCode = main(process.argv.slice(2));
process.exitCode = exitCode;

function main(args: string[]): number {
  try {
    if (args.length === 0 || isHelpFlag(args[0])) {
      printHelp();
      return 0;
    }

    if (isVersionFlag(args[0])) {
      console.log(cliVersion);
      return 0;
    }

    if (args[0] === "help") {
      printHelp();
      return 0;
    }

    if (args[0] === "demo") {
      return runDemoCommand();
    }

    if (args[0] === "evaluate") {
      return runEvaluateCommand(args.slice(1));
    }

    if (args[0] === "audit") {
      return runAuditCommand(args.slice(1));
    }

    printError(`Unknown command: ${args[0]}`);
    printHelp();
    return 1;
  } catch (error) {
    printError(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

function runDemoCommand(): number {
  const run = runLaunchCopilotDemo({
    mode: "cli",
    version: cliVersion,
    printAuditLog: false,
    writeReceipt: true,
  });

  return run.matchedExpected === run.actions.length ? 0 : 1;
}

function runEvaluateCommand(args: string[]): number {
  const evaluateOptions = parseEvaluateArgs(args);
  const actionFile = evaluateOptions.actionFile;

  if (!actionFile || actionFile.startsWith("-")) {
    throw new Error("Missing action JSON file.");
  }

  const profileId = evaluateOptions.profileId;
  const policyProfile = getPolicyProfileById(profileId);

  if (!policyProfile) {
    throw new Error(`Unknown policy profile: ${profileId}`);
  }

  const sourceFile = path.resolve(actionFile);
  const loadedAction = loadActionInput(sourceFile, profileId);
  const input = loadedAction.input;
  const result = evaluateAction(input, { policyProfile });
  const reason =
    result.policyProfile?.reason ??
    result.evidence[0] ??
    result.recommendedAction;
  const humanDecision = getHumanDecision(result.decision);
  const finalOutcome = getFinalOutcome(result.decision, humanDecision);
  const receiptPath = writeEvaluationReceipt({
    command: "evaluate",
    input,
    result,
    reason,
    humanDecision,
    finalOutcome,
    sourceFile,
    policyProfile,
  });

  printEvaluationResult(
    loadedAction.displayName,
    input,
    profileId,
    result,
    reason,
    receiptPath,
  );

  return 0;
}

function runAuditCommand(args: string[]): number {
  const auditOptions = parseAuditArgs(args);
  const result = auditReceipts({
    receiptsDir: auditOptions.receiptsDir,
  });

  console.log(formatAuditReport(result));

  return result.failed === 0 ? 0 : 1;
}

function parseEvaluateArgs(args: string[]): {
  actionFile: string | undefined;
  profileId: string;
} {
  const actionFile = args[0];
  let profileId = "default";
  let index = 1;

  while (index < args.length) {
    const arg = args[index];

    if (arg === "--profile") {
      const value = args[index + 1];

      if (!value) {
        throw new Error("Missing value for --profile.");
      }

      profileId = value;
      index += 2;
      continue;
    }

    if (arg === "--write-receipt") {
      index += 1;
      continue;
    }

    throw new Error(
      "Invalid arguments. Use: agent-action-gate evaluate <action.json> [--profile <profileId>] [--write-receipt]",
    );
  }

  return {
    actionFile,
    profileId,
  };
}

function parseAuditArgs(args: string[]): {
  receiptsDir?: string;
} {
  if (args.length === 0) {
    return {};
  }

  if (args.length === 2 && args[0] === "--receipts-dir" && args[1]) {
    return {
      receiptsDir: args[1],
    };
  }

  throw new Error(
    "Invalid arguments. Use: agent-action-gate audit [--receipts-dir <dir>]",
  );
}

function loadActionInput(sourceFile: string, profileId: string): LoadedAction {
  let parsed: unknown;

  try {
    parsed = JSON.parse(readFileSync(sourceFile, "utf8"));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${sourceFile}.`);
    }

    throw new Error(`Unable to read action file: ${sourceFile}`);
  }

  if (isActionGateInput(parsed)) {
    const input = {
      ...parsed,
      policyProfileId: parsed.policyProfileId ?? profileId,
    };

    return {
      input,
      displayName: input.proposedAction.actionType,
    };
  }

  if (!isCliActionFile(parsed)) {
    throw new Error(
      "Action file must include at least tool and actionType, or a full ActionGateInput shape.",
    );
  }

  return {
    input: toActionGateInput(parsed, profileId),
    displayName: parsed.title ?? parsed.actionType,
  };
}

function toActionGateInput(
  action: CliActionFile,
  profileId: string,
): ActionGateInput {
  const payload = {
    ...(action.payload ?? {}),
    ...(action.description ? { description: action.description } : {}),
    ...(action.dataSensitivity
      ? { dataSensitivity: action.dataSensitivity }
      : {}),
  };

  return {
    userRequest:
      action.description ??
      action.title ??
      `Evaluate proposed action ${action.actionType}.`,
    proposedAction: {
      tool: action.tool,
      actionType: action.actionType,
      target: action.target,
      payload,
      reversible: action.reversible,
      externalFacing: action.externalEffect,
    },
    context: {
      userApproved: false,
      environment: action.externalEffect ? "production" : "dev",
    },
    policyProfileId: profileId,
  };
}

function printEvaluationResult(
  displayName: string,
  input: ActionGateInput,
  profileId: string,
  result: ReturnType<typeof evaluateAction>,
  reason: string,
  receiptPath: string,
): void {
  console.log(`Agent Action Gate CLI v${cliVersion}`);
  console.log("Evaluation");
  console.log("");
  console.log(`Action: ${displayName}`);
  console.log(`Action type: ${input.proposedAction.actionType}`);

  if (input.proposedAction.target) {
    console.log(`Target: ${input.proposedAction.target}`);
  }

  console.log(`Policy Profile: ${profileId}`);
  console.log(`Decision: ${result.decision}`);
  console.log(`Reason: ${reason}`);

  if (result.primaryIssue) {
    console.log(`Primary issue: ${result.primaryIssue}`);
  }

  if (result.policyProfile) {
    console.log(`Policy metadata: ${JSON.stringify(result.policyProfile)}`);
  }

  if (result.reviewPacket) {
    console.log("");
    printReviewPacket(result.reviewPacket);
  }

  console.log("");
  console.log("Receipt written to:");
  console.log(receiptPath.replace(/\\/g, "/"));
}

function getHumanDecision(decision: string): HumanDecision {
  if (decision === "allow") {
    return "not_required";
  }

  return "not_requested";
}

function getFinalOutcome(
  decision: string,
  humanDecision: HumanDecision,
): FinalOutcome {
  if (decision === "allow") {
    return "not_executed";
  }

  if (decision === "require_approval" && humanDecision === "approved") {
    return "simulated_execution_after_approval";
  }

  if (decision === "revise_action") {
    return "needs_revision";
  }

  if (decision === "block") {
    return "stopped_by_gate";
  }

  return "not_executed";
}

function isActionGateInput(value: unknown): value is ActionGateInput {
  if (!isRecord(value) || typeof value.userRequest !== "string") {
    return false;
  }

  if (!isRecord(value.proposedAction)) {
    return false;
  }

  return (
    typeof value.proposedAction.tool === "string" &&
    typeof value.proposedAction.actionType === "string"
  );
}

function isCliActionFile(value: unknown): value is CliActionFile {
  return (
    isRecord(value) &&
    typeof value.tool === "string" &&
    typeof value.actionType === "string" &&
    (value.payload === undefined || isRecord(value.payload))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
}

function isVersionFlag(value: string | undefined): boolean {
  return value === "--version" || value === "-v";
}

function printHelp(): void {
  console.log(`Agent Action Gate CLI

Usage:
  agent-action-gate demo
  agent-action-gate evaluate <action.json> [--profile <profileId>] [--write-receipt]
  agent-action-gate audit [--receipts-dir <dir>]
  agent-action-gate help

Examples:
  npx agent-action-gate demo
  npx agent-action-gate evaluate examples/actions/send-email.json --profile strict-external-actions
  npx agent-action-gate audit

Profiles:
${builtInPolicyProfiles.map((profile) => `  ${profile.id}`).join("\n")}`);
}

function printError(message: string): void {
  console.error(`Error: ${message}`);
}
