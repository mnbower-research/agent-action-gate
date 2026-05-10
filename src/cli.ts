#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  createEffectiveAagConfig,
  defaultConfigPath,
  type AagConfigInput,
} from "./actionGate/aagConfig";
import {
  formatApprovalAuthorityCoverage,
  scanApprovalAuthorityCoverage,
} from "./actionGate/approvalAuthority";
import { auditReceipts } from "./actionGate/auditReceipts";
import { actionGateDetectors, evaluateAction } from "./actionGate/evaluateAction";
import { formatAuditReport } from "./actionGate/formatAuditReport";
import { formatGovernanceCheck } from "./actionGate/formatGovernanceCheck";
import { formatLockStatus } from "./actionGate/formatLockStatus";
import { formatMetaGateReport } from "./actionGate/formatMetaGateReport";
import { printReviewPacket } from "./actionGate/formatReviewPacket";
import { routeActionToGate } from "./actionGate/gates/gateRegistry";
import type { GovernanceCheckResult } from "./actionGate/governanceWeakening";
import { runLaunchCopilotDemo } from "./actionGate/launchCopilotDemo";
import {
  evaluateMetaGateAction,
  type MetaGateDecision,
  type MetaGateInput,
} from "./actionGate/metaGate";
import {
  builtInPolicyProfiles,
  defaultPolicyProfile,
  getPolicyProfileById,
} from "./actionGate/policyProfiles";
import {
  formatPolicyProvenance,
  verifyPolicyProvenanceCoverage,
} from "./actionGate/policyProvenance";
import {
  formatReceiptHashChainVerification,
  verifyReceiptHashChain,
  type ReceiptChainSource,
} from "./actionGate/receiptHashChain";
import type { ActionGateInput, GateDecision } from "./actionGate/types";
import {
  createConfigHash,
  createPolicyHash,
  type FinalOutcome,
  type HumanDecision,
  writeEvaluationReceipt,
  writeMetaGateReceipt,
} from "./actionGate/writeReceipt";
import {
  appendWorkflowAction,
  createWorkflowActionId,
  createWorkflowScope,
  formatWorkflowAddActionReport,
  formatWorkflowStartReport,
  formatWorkflowStatusReport,
  loadLatestWorkflowLedger,
  writeWorkflowLedger,
  writeWorkflowLedgerUpdate,
} from "./actionGate/workflowScopeLedger";

const cliVersion = "1.6.1";

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

    if (args[0] === "route") {
      return runRouteCommand(args.slice(1));
    }

    if (args[0] === "evaluate") {
      return runEvaluateCommand(args.slice(1));
    }

    if (args[0] === "audit") {
      return runAuditCommand(args.slice(1));
    }

    if (args[0] === "verify-receipts") {
      return runVerifyReceiptsCommand(args.slice(1));
    }

    if (args[0] === "policy-provenance") {
      return runPolicyProvenanceCommand(args.slice(1));
    }

    if (args[0] === "authority-map") {
      return runAuthorityMapCommand(args.slice(1));
    }

    if (args[0] === "lock-status") {
      return runLockStatusCommand(args.slice(1));
    }

    if (args[0] === "check-config-change") {
      return runCheckConfigChangeCommand(args.slice(1));
    }

    if (args[0] === "metagate") {
      return runMetaGateCommand(args.slice(1));
    }

    if (args[0] === "workflow-start") {
      return runWorkflowStartCommand(args.slice(1));
    }

    if (args[0] === "workflow-add-action") {
      return runWorkflowAddActionCommand(args.slice(1));
    }

    if (args[0] === "workflow-status") {
      return runWorkflowStatusCommand(args.slice(1));
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

function runRouteCommand(args: string[]): number {
  const actionFile = args[0];

  if (!actionFile || actionFile.startsWith("-")) {
    throw new Error("Missing action JSON file.");
  }

  if (args.length > 1) {
    throw new Error("Invalid arguments. Use: agent-action-gate route <action.json>");
  }

  const sourceFile = path.resolve(actionFile);
  const loadedAction = loadActionInput(sourceFile, "default");
  const input = loadedAction.input;
  const route = routeActionToGate(input);

  printRouteResult(loadedAction.displayName, input, route);

  return 0;
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

function runVerifyReceiptsCommand(args: string[]): number {
  const options = parseVerifyReceiptsArgs(args);
  const result = verifyReceiptHashChain({
    source: options.source,
  });

  console.log(
    options.json
      ? JSON.stringify(result, null, 2)
      : formatReceiptHashChainVerification(result),
  );

  return result.valid ? 0 : 1;
}

function runPolicyProvenanceCommand(args: string[]): number {
  const options = parsePolicyProvenanceArgs(args);
  const result = verifyPolicyProvenanceCoverage({
    source: options.source,
  });

  console.log(
    options.json ? JSON.stringify(result, null, 2) : formatPolicyProvenance(result),
  );

  return result.valid ? 0 : 1;
}

function runAuthorityMapCommand(args: string[]): number {
  const options = parseAuthorityMapArgs(args);
  const result = scanApprovalAuthorityCoverage({
    source: options.source,
  });

  console.log(
    options.json
      ? JSON.stringify(result, null, 2)
      : formatApprovalAuthorityCoverage(result),
  );

  return result.valid ? 0 : 1;
}

function runLockStatusCommand(args: string[]): number {
  const options = parseLockStatusArgs(args);
  const config = loadEffectiveConfig(options.configFile);
  const configHash = createConfigHash({ config });
  const policyHash = createPolicyHash(defaultPolicyProfile);

  console.log(
    formatLockStatus({
      config,
      configHash,
      policyHash,
    }),
  );

  return 0;
}

function runCheckConfigChangeCommand(args: string[]): number {
  const options = parseCheckConfigChangeArgs(args);
  const previousConfig = loadEffectiveConfig(options.beforeFile);
  const nextConfig = loadEffectiveConfig(options.afterFile);
  const metaGateInput: MetaGateInput = {
    actionType: "modify_config",
    target: options.afterFile,
    beforeConfig: previousConfig,
    afterConfig: nextConfig,
    locked: previousConfig.locked,
  };
  const metaGateDecision = evaluateMetaGateAction(metaGateInput);
  const result = toGovernanceCheckResult(metaGateDecision);
  const receiptPath = options.writeReceipt
    ? writeMetaGateReceipt({
        command: "check-config-change",
        input: metaGateInput,
        decision: metaGateDecision,
        previousConfig,
        nextConfig,
        policyProfile: defaultPolicyProfile,
      })
    : undefined;

  console.log(
    formatGovernanceCheck({
      result,
      receiptPath,
    }),
  );

  return 0;
}

function runMetaGateCommand(args: string[]): number {
  const options = parseMetaGateArgs(args);
  const previousConfig = options.beforeFile
    ? loadEffectiveConfig(options.beforeFile)
    : loadEffectiveConfig(undefined);
  const nextConfig = options.afterFile
    ? loadEffectiveConfig(options.afterFile)
    : undefined;
  const input: MetaGateInput = {
    actionType: options.actionType,
    target: options.target,
    beforeConfig: previousConfig,
    ...(nextConfig ? { afterConfig: nextConfig } : {}),
    locked: previousConfig.locked,
    ...(options.requestedBy ? { requestedBy: options.requestedBy } : {}),
    ...(options.reason ? { reason: options.reason } : {}),
  };
  const decision = evaluateMetaGateAction(input);
  const receiptPath = options.writeReceipt
    ? writeMetaGateReceipt({
        command: "metagate",
        input,
        decision,
        previousConfig,
        nextConfig,
        policyProfile: defaultPolicyProfile,
      })
    : undefined;

  console.log(
    formatMetaGateReport({
      input,
      decision,
      receiptPath,
    }),
  );

  return decision.decision === "block" ? 1 : 0;
}

function runWorkflowStartCommand(args: string[]): number {
  const options = parseWorkflowStartArgs(args);
  const ledger = createWorkflowScope({
    originalIntent: options.intent,
    allowedScope: options.allowedScope,
    prohibitedScope: options.prohibitedScope,
    ...(options.createdBy ? { createdBy: options.createdBy } : {}),
  });
  const paths = writeWorkflowLedger(ledger);

  console.log(formatWorkflowStartReport(ledger, paths.ledgers));

  return 0;
}

function runWorkflowAddActionCommand(args: string[]): number {
  const options = parseWorkflowAddActionArgs(args);
  const ledger = loadLatestWorkflowLedger(options.workflowId);
  const actionId = createWorkflowActionId({
    workflowId: options.workflowId,
    actionType: options.actionType,
    target: options.target,
    summary: options.summary,
  });
  const nextLedger = appendWorkflowAction({
    ledger,
    action: {
      actionId,
      workflowId: options.workflowId,
      actionType: options.actionType,
      ...(options.target ? { target: options.target } : {}),
      decision: options.decision,
      ...(options.receiptId ? { receiptId: options.receiptId } : {}),
      ...(options.riskFlags.length > 0 ? { riskFlags: options.riskFlags } : {}),
      ...(options.summary ? { summary: options.summary } : {}),
    },
  });
  const action = nextLedger.actions[nextLedger.actions.length - 1];

  if (!action) {
    throw new Error("Unable to append workflow action.");
  }

  writeWorkflowLedgerUpdate(nextLedger, action);

  console.log(formatWorkflowAddActionReport(nextLedger, action));

  return 0;
}

function runWorkflowStatusCommand(args: string[]): number {
  const options = parseWorkflowStatusArgs(args);
  const ledger = loadLatestWorkflowLedger(options.workflowId);

  console.log(formatWorkflowStatusReport(ledger));

  return 0;
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

function parseVerifyReceiptsArgs(args: string[]): {
  json: boolean;
  source: ReceiptChainSource;
} {
  let json = false;
  let source: ReceiptChainSource = "all";
  let index = 0;

  while (index < args.length) {
    const arg = args[index];

    if (arg === "--json") {
      json = true;
      index += 1;
      continue;
    }

    if (arg === "--source") {
      const value = args[index + 1];

      if (
        value !== "receipts" &&
        value !== "distribution" &&
        value !== "all"
      ) {
        throw new Error("Invalid --source. Use receipts, distribution, or all.");
      }

      source = value;
      index += 2;
      continue;
    }

    throw new Error(
      "Invalid arguments. Use: agent-action-gate verify-receipts [--json] [--source receipts|distribution|all]",
    );
  }

  return {
    json,
    source,
  };
}

function parsePolicyProvenanceArgs(args: string[]): {
  json: boolean;
  source: ReceiptChainSource;
} {
  let json = false;
  let source: ReceiptChainSource = "all";
  let index = 0;

  while (index < args.length) {
    const arg = args[index];

    if (arg === "--json") {
      json = true;
      index += 1;
      continue;
    }

    if (arg === "--source") {
      const value = args[index + 1];

      if (
        value !== "receipts" &&
        value !== "distribution" &&
        value !== "all"
      ) {
        throw new Error("Invalid --source. Use receipts, distribution, or all.");
      }

      source = value;
      index += 2;
      continue;
    }

    throw new Error(
      "Invalid arguments. Use: agent-action-gate policy-provenance [--json] [--source receipts|distribution|all]",
    );
  }

  return {
    json,
    source,
  };
}

function parseAuthorityMapArgs(args: string[]): {
  json: boolean;
  source: ReceiptChainSource;
} {
  let json = false;
  let source: ReceiptChainSource = "all";
  let index = 0;

  while (index < args.length) {
    const arg = args[index];

    if (arg === "--json") {
      json = true;
      index += 1;
      continue;
    }

    if (arg === "--source") {
      const value = args[index + 1];

      if (
        value !== "receipts" &&
        value !== "distribution" &&
        value !== "all"
      ) {
        throw new Error("Invalid --source. Use receipts, distribution, or all.");
      }

      source = value;
      index += 2;
      continue;
    }

    throw new Error(
      "Invalid arguments. Use: agent-action-gate authority-map [--json] [--source receipts|distribution|all]",
    );
  }

  return {
    json,
    source,
  };
}

function parseLockStatusArgs(args: string[]): {
  configFile?: string;
} {
  if (args.length === 0) {
    return {};
  }

  if (args.length === 2 && args[0] === "--config" && args[1]) {
    return {
      configFile: args[1],
    };
  }

  throw new Error("Invalid arguments. Use: agent-action-gate lock-status [--config <config.json>]");
}

function parseCheckConfigChangeArgs(args: string[]): {
  beforeFile: string;
  afterFile: string;
  writeReceipt: boolean;
} {
  let beforeFile: string | undefined;
  let afterFile: string | undefined;
  let writeReceipt = false;
  let index = 0;

  while (index < args.length) {
    const arg = args[index];

    if (arg === "--before") {
      beforeFile = args[index + 1];
      index += 2;
      continue;
    }

    if (arg === "--after") {
      afterFile = args[index + 1];
      index += 2;
      continue;
    }

    if (arg === "--write-receipt") {
      writeReceipt = true;
      index += 1;
      continue;
    }

    throw new Error(
      "Invalid arguments. Use: agent-action-gate check-config-change --before <before.json> --after <after.json> [--write-receipt]",
    );
  }

  if (!beforeFile || !afterFile) {
    throw new Error("Missing --before or --after config file.");
  }

  return {
    beforeFile,
    afterFile,
    writeReceipt,
  };
}

function parseMetaGateArgs(args: string[]): {
  actionType: string;
  target: string;
  beforeFile?: string;
  afterFile?: string;
  requestedBy?: string;
  reason?: string;
  writeReceipt: boolean;
} {
  let actionType: string | undefined;
  let target: string | undefined;
  let beforeFile: string | undefined;
  let afterFile: string | undefined;
  let requestedBy: string | undefined;
  let reason: string | undefined;
  let writeReceipt = false;
  let index = 0;

  while (index < args.length) {
    const arg = args[index];

    if (arg === "--action") {
      actionType = args[index + 1];
      index += 2;
      continue;
    }

    if (arg === "--target") {
      target = args[index + 1];
      index += 2;
      continue;
    }

    if (arg === "--before") {
      beforeFile = args[index + 1];
      index += 2;
      continue;
    }

    if (arg === "--after") {
      afterFile = args[index + 1];
      index += 2;
      continue;
    }

    if (arg === "--requested-by") {
      requestedBy = args[index + 1];
      index += 2;
      continue;
    }

    if (arg === "--reason") {
      reason = args[index + 1];
      index += 2;
      continue;
    }

    if (arg === "--write-receipt") {
      writeReceipt = true;
      index += 1;
      continue;
    }

    throw new Error(
      "Invalid arguments. Use: agent-action-gate metagate --action <actionType> --target <target> [--before <before.json>] [--after <after.json>] [--requested-by <name>] [--reason <text>] [--write-receipt]",
    );
  }

  if (!actionType || !target) {
    throw new Error("Missing --action or --target.");
  }

  return {
    actionType,
    target,
    beforeFile,
    afterFile,
    requestedBy,
    reason,
    writeReceipt,
  };
}

function parseWorkflowStartArgs(args: string[]): {
  intent: string;
  allowedScope: string[];
  prohibitedScope: string[];
  createdBy?: string;
} {
  let intent: string | undefined;
  let createdBy: string | undefined;
  const allowedScope: string[] = [];
  const prohibitedScope: string[] = [];
  let index = 0;

  while (index < args.length) {
    const arg = args[index];
    const value = args[index + 1];

    if (arg === "--intent") {
      intent = requireArgValue(arg, value);
      index += 2;
      continue;
    }

    if (arg === "--allow") {
      allowedScope.push(requireArgValue(arg, value));
      index += 2;
      continue;
    }

    if (arg === "--deny") {
      prohibitedScope.push(requireArgValue(arg, value));
      index += 2;
      continue;
    }

    if (arg === "--created-by") {
      createdBy = requireArgValue(arg, value);
      index += 2;
      continue;
    }

    throw new Error(
      'Invalid arguments. Use: agent-action-gate workflow-start --intent "<intent>" --allow "<scope>" [--allow "<scope>"] [--deny "<scope>"]',
    );
  }

  if (!intent) {
    throw new Error("Missing --intent.");
  }

  if (allowedScope.length === 0) {
    throw new Error("At least one --allow value is required.");
  }

  return {
    intent,
    allowedScope,
    prohibitedScope,
    createdBy,
  };
}

function parseWorkflowAddActionArgs(args: string[]): {
  workflowId: string;
  actionType: string;
  target?: string;
  decision: GateDecision;
  receiptId?: string;
  riskFlags: string[];
  summary?: string;
} {
  let workflowId: string | undefined;
  let actionType: string | undefined;
  let target: string | undefined;
  let decision: GateDecision | undefined;
  let receiptId: string | undefined;
  let summary: string | undefined;
  const riskFlags: string[] = [];
  let index = 0;

  while (index < args.length) {
    const arg = args[index];
    const value = args[index + 1];

    if (arg === "--workflow") {
      workflowId = requireArgValue(arg, value);
      index += 2;
      continue;
    }

    if (arg === "--action") {
      actionType = requireArgValue(arg, value);
      index += 2;
      continue;
    }

    if (arg === "--target") {
      target = requireArgValue(arg, value);
      index += 2;
      continue;
    }

    if (arg === "--decision") {
      const parsedDecision = requireArgValue(arg, value);

      if (!isGateDecision(parsedDecision)) {
        throw new Error("Invalid --decision. Use allow, require_approval, revise_action, or block.");
      }

      decision = parsedDecision;
      index += 2;
      continue;
    }

    if (arg === "--receipt") {
      receiptId = requireArgValue(arg, value);
      index += 2;
      continue;
    }

    if (arg === "--risk") {
      riskFlags.push(requireArgValue(arg, value));
      index += 2;
      continue;
    }

    if (arg === "--summary") {
      summary = requireArgValue(arg, value);
      index += 2;
      continue;
    }

    throw new Error(
      "Invalid arguments. Use: agent-action-gate workflow-add-action --workflow <workflowId> --action <actionType> --decision <decision> [--target <target>] [--receipt <receiptId>] [--risk <riskFlag>] [--summary <summary>]",
    );
  }

  if (!workflowId || !actionType || !decision) {
    throw new Error("Missing --workflow, --action, or --decision.");
  }

  return {
    workflowId,
    actionType,
    target,
    decision,
    receiptId,
    riskFlags,
    summary,
  };
}

function parseWorkflowStatusArgs(args: string[]): {
  workflowId: string;
} {
  if (args.length === 2 && args[0] === "--workflow" && args[1]) {
    return {
      workflowId: args[1],
    };
  }

  throw new Error(
    "Invalid arguments. Use: agent-action-gate workflow-status --workflow <workflowId>",
  );
}

function toGovernanceCheckResult(
  decision: MetaGateDecision,
): GovernanceCheckResult {
  const detectorsTriggered = decision.detectorsTriggered.filter(
    (detector) => detector !== "metaGate",
  );
  if (decision.decision === "allow") {
    return {
      locked: decision.locked,
      decision: decision.decision,
      governanceChangeType: "metadata_update",
      detectorsTriggered: [],
      changes: ["No risky governance weakening detected."],
      findings: [],
    };
  }

  const changes = decision.reasons.filter(
    (reason) =>
      reason !== "Locked policy mode is active." && reason !== "AAG is locked.",
  );

  return {
    locked: decision.locked,
    decision: decision.decision,
    governanceChangeType: decision.governanceChangeType ?? "metadata_update",
    detectorsTriggered,
    changes:
      changes.length > 0
        ? changes
        : ["No risky governance weakening detected."],
    findings: [],
  };
}

function loadEffectiveConfig(configFile: string | undefined): ReturnType<
  typeof createEffectiveAagConfig
> {
  const configInput = loadConfigInput(configFile);

  return createEffectiveAagConfig({
    config: configInput,
    detectorIds: actionGateDetectors.map((detector) => detector.name),
  });
}

function loadConfigInput(configFile: string | undefined): AagConfigInput {
  if (!configFile && !existsSync(defaultConfigPath)) {
    return {};
  }

  const sourceFile = path.resolve(configFile ?? defaultConfigPath);
  let parsed: unknown;

  try {
    parsed = JSON.parse(readFileSync(sourceFile, "utf8"));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${sourceFile}.`);
    }

    throw new Error(`Unable to read config file: ${sourceFile}`);
  }

  if (!isRecord(parsed)) {
    throw new Error(`Config file must contain a JSON object: ${sourceFile}`);
  }

  return parsed;
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
  if (result.gateRoute) {
    console.log(`Gate Route: ${result.gateRoute.gateId}`);
  }
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

function printRouteResult(
  displayName: string,
  input: ActionGateInput,
  route: ReturnType<typeof routeActionToGate>,
): void {
  console.log(`Agent Action Gate CLI v${cliVersion}`);
  console.log("Gate Route");
  console.log("");
  console.log(`Action: ${displayName}`);
  console.log(`Action type: ${input.proposedAction.actionType}`);
  console.log(`Tool: ${input.proposedAction.tool}`);

  if (input.proposedAction.target) {
    console.log(`Target: ${input.proposedAction.target}`);
  }

  console.log(`Selected gate: ${route.gateId}`);
  console.log(`Category: ${route.category}`);
  console.log(`Reason: ${route.reason}`);
  console.log(`Matched signals: ${route.matchedSignals.join(", ")}`);
  console.log(`Confidence: ${route.confidence}`);
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

function requireArgValue(flag: string, value: string | undefined): string {
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}.`);
  }

  return value;
}

function isGateDecision(value: string): value is GateDecision {
  return (
    value === "allow" ||
    value === "require_approval" ||
    value === "revise_action" ||
    value === "block"
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
  agent-action-gate route <action.json>
  agent-action-gate evaluate <action.json> [--profile <profileId>] [--write-receipt]
  agent-action-gate audit [--receipts-dir <dir>]
  agent-action-gate verify-receipts [--json] [--source receipts|distribution|all]
  agent-action-gate policy-provenance [--json] [--source receipts|distribution|all]
  agent-action-gate authority-map [--json] [--source receipts|distribution|all]
  agent-action-gate lock-status [--config <config.json>]
  agent-action-gate check-config-change --before <before.json> --after <after.json> [--write-receipt]
  agent-action-gate metagate --action <actionType> --target <target> [--before <before.json>] [--after <after.json>] [--requested-by <name>] [--reason <text>] [--write-receipt]
  agent-action-gate workflow-start --intent <intent> --allow <scope> [--allow <scope>] [--deny <scope>]
  agent-action-gate workflow-add-action --workflow <workflowId> --action <actionType> --decision <decision> [--target <target>] [--receipt <receiptId>] [--risk <riskFlag>] [--summary <summary>]
  agent-action-gate workflow-status --workflow <workflowId>
  agent-action-gate help

Examples:
  npx agent-action-gate demo
  npx agent-action-gate route examples/actions/send-email.json
  npx agent-action-gate evaluate examples/actions/send-email.json --profile strict-external-actions
  npx agent-action-gate audit
  npx agent-action-gate verify-receipts
  npx agent-action-gate policy-provenance
  npx agent-action-gate authority-map
  npx agent-action-gate lock-status
  npx agent-action-gate check-config-change --before examples/config/locked-before.json --after examples/config/weakened-after.json --write-receipt
  npx agent-action-gate metagate --action disable_gate --target aag.config.json --write-receipt
  npx agent-action-gate workflow-start --intent "Distribute AAG safely" --allow "research public posts" --allow "draft comments" --deny "auto-post"
  npx agent-action-gate workflow-add-action --workflow wf_example --action draft_comment --decision allow --summary "Drafted LinkedIn comment"
  npx agent-action-gate workflow-status --workflow wf_example

Fresh-clone local examples:
  npm run cli -- demo
  npm run cli -- route examples/actions/send-email.json
  npm run cli -- evaluate examples/actions/send-email.json --profile strict-external-actions
  npm run cli -- audit
  npm run cli -- verify-receipts

Profiles:
${builtInPolicyProfiles.map((profile) => `  ${profile.id}`).join("\n")}`);
}

function printError(message: string): void {
  console.error(`Error: ${message}`);
}
