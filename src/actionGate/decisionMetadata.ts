import { sha256Stable } from "./stableHash";
import type {
  AagReasonCode,
  ActionGateInput,
  ActionGateResult,
  DecisionApprovalStatus,
  DecisionAuthorityStatus,
  DecisionClosureCandidate,
  DecisionMetadata,
  GateDetectorResult,
  ReceiptCandidate,
} from "./types";

export const decisionVersion = "2.1.0" as const;

type BuildDecisionMetadataArgs = {
  input: ActionGateInput;
  result: Omit<ActionGateResult, "decisionMetadata">;
  evaluatedAt?: Date | string;
};

export function buildDecisionMetadata(
  args: BuildDecisionMetadataArgs,
): DecisionMetadata {
  const evaluatedAt = toIsoTimestamp(args.evaluatedAt ?? new Date());
  const reasonCodes = getReasonCodes(args.input, args.result);
  const policyIds = getPolicyIds(args.result);
  const hardBoundaryIds = getHardBoundaryIds(args.result);
  const authorityStatus = getAuthorityStatus(args.input, args.result);
  const approvalStatus = getApprovalStatus(args.input, args.result);
  const runtimePermitRequired = isRuntimePermitRequired(args.result);
  const runtimePermitId = args.input.context?.runtimePermitId;
  const decisionHash = createDecisionHash({
    input: args.input,
    result: args.result,
    reasonCodes,
    policyIds,
    hardBoundaryIds,
    authorityStatus,
    approvalStatus,
    runtimePermitRequired,
    runtimePermitId,
  });
  const decisionId = createDecisionId(decisionHash);
  const receiptCandidate = createReceiptCandidate({
    input: args.input,
    result: args.result,
    decisionId,
    evaluatedAt,
    decisionHash,
    reasonCodes,
    policyIds,
    hardBoundaryIds,
    runtimePermitRequired,
    runtimePermitId,
  });
  const closureCandidate = createClosureCandidate({
    input: args.input,
    result: args.result,
    decisionHash,
    reasonCodes,
    policyIds,
    hardBoundaryIds,
    authorityStatus,
    runtimePermitRequired,
    runtimePermitId,
  });

  return {
    decisionId,
    decisionVersion,
    evaluatedAt,
    decisionHash,
    reasonCodes,
    policyIds,
    hardBoundaryIds,
    authorityStatus,
    approvalStatus,
    runtimePermitRequired,
    ...(runtimePermitId ? { runtimePermitId } : {}),
    receiptCandidate,
    closureCandidate,
  };
}

export function createDecisionHash(args: {
  input: ActionGateInput;
  result: Omit<ActionGateResult, "decisionMetadata">;
  reasonCodes: AagReasonCode[];
  policyIds: string[];
  hardBoundaryIds: string[];
  authorityStatus: DecisionAuthorityStatus;
  approvalStatus: DecisionApprovalStatus;
  runtimePermitRequired: boolean;
  runtimePermitId?: string;
}): string {
  return sha256Stable({
    decisionVersion,
    action: summarizeActionForHash(args.input),
    decision: {
      outcome: args.result.decision,
      riskLevel: args.result.riskLevel,
      primaryIssue: args.result.primaryIssue,
      confidence: args.result.confidence,
      evidence: args.result.evidence,
      recommendedAction: args.result.recommendedAction,
      reasonCodes: args.reasonCodes,
      policyIds: args.policyIds,
      hardBoundaryIds: args.hardBoundaryIds,
      authorityStatus: args.authorityStatus,
      approvalStatus: args.approvalStatus,
      runtimePermitRequired: args.runtimePermitRequired,
      runtimePermitId: args.runtimePermitId,
    },
    gateRoute: args.result.gateRoute
      ? {
          gateId: args.result.gateRoute.gateId,
          category: args.result.gateRoute.category,
          confidence: args.result.gateRoute.confidence,
          matchedSignals: args.result.gateRoute.matchedSignals,
        }
      : undefined,
    policyProfile: args.result.policyProfile,
    detectorResults: args.result.detectorResults.map((result) => ({
      type: result.type,
      triggered: result.triggered,
      confidence: result.confidence,
      severity: result.severity,
      evidence: result.evidence,
      recommendedDecision: result.recommendedDecision,
    })),
  });
}

function getReasonCodes(
  input: ActionGateInput,
  result: Omit<ActionGateResult, "decisionMetadata">,
): AagReasonCode[] {
  const codes = new Set<AagReasonCode>();
  const triggeredResults = result.detectorResults.filter(
    (detectorResult) => detectorResult.triggered,
  );

  if (result.decision === "allow" && triggeredResults.length === 0) {
    codes.add("AAG-ALLOW-SAFE-INTERNAL");
  }

  for (const detectorResult of triggeredResults) {
    for (const code of getDetectorReasonCodes(input, detectorResult)) {
      codes.add(code);
    }
  }

  if (
    result.policyProfile?.matchedRule === "defaults.highSensitivityData" &&
    result.decision === "require_approval"
  ) {
    codes.add("AAG-REQUIRE-APPROVAL-HIGH-SENSITIVITY");
  }

  if (
    result.policyProfile?.matchedRule === "defaults.externalEffect" &&
    result.decision === "require_approval"
  ) {
    codes.add("AAG-REQUIRE-APPROVAL-EXTERNAL-ACTION");
  }

  if (result.decision === "block") {
    codes.add("AAG-BLOCK-HARD-BOUNDARY");
  }

  if (
    result.decision === "revise_action" ||
    result.reviewPacket?.reviewerQuestion.includes("must change")
  ) {
    codes.add("AAG-REVISE-TO-REVIEW-PACKET");
  }

  if (result.approvalQuality?.issues.includes("missing_approval_authority")) {
    codes.add("AAG-ESCALATE-AUTHORITY-UNCLEAR");
  }

  return Array.from(codes).sort();
}

function getDetectorReasonCodes(
  input: ActionGateInput,
  detectorResult: GateDetectorResult,
): AagReasonCode[] {
  if (detectorResult.type === "sensitive_data_exposure") {
    return ["AAG-BLOCK-SENSITIVE-DATA-EXPOSURE"];
  }

  if (
    detectorResult.type === "data_exfiltration" ||
    detectorResult.type === "credential_access"
  ) {
    return [
      "AAG-BLOCK-SENSITIVE-DATA-EXPOSURE",
      "AAG-BLOCK-HARD-BOUNDARY",
    ];
  }

  if (detectorResult.type === "wrong_target") {
    return ["AAG-BLOCK-RUNTIME-TARGET-MISMATCH"];
  }

  if (detectorResult.type === "tool_mismatch") {
    return ["AAG-BLOCK-TOOL-MISMATCH"];
  }

  if (
    detectorResult.type === "irreversible_action" &&
    input.context?.userApproved !== true
  ) {
    return ["AAG-BLOCK-IRREVERSIBLE-WITHOUT-APPROVAL"];
  }

  if (
    detectorResult.type === "missing_approval" &&
    input.proposedAction.externalFacing
  ) {
    return ["AAG-REQUIRE-APPROVAL-EXTERNAL-ACTION"];
  }

  if (detectorResult.recommendedDecision === "block") {
    return ["AAG-BLOCK-HARD-BOUNDARY"];
  }

  if (detectorResult.recommendedDecision === "revise_action") {
    return ["AAG-REVISE-TO-REVIEW-PACKET"];
  }

  return [];
}

function getPolicyIds(
  result: Omit<ActionGateResult, "decisionMetadata">,
): string[] {
  const policyProfile = result.policyProfile;

  if (!policyProfile) {
    return [];
  }

  return [
    `policy:${policyProfile.id}`,
    ...(policyProfile.matchedRule
      ? [`policy:${policyProfile.id}:${policyProfile.matchedRule}`]
      : []),
  ];
}

function getHardBoundaryIds(
  result: Omit<ActionGateResult, "decisionMetadata">,
): string[] {
  const detectorBoundaries = result.detectorResults
    .filter(
      (detectorResult) =>
        detectorResult.triggered &&
        detectorResult.recommendedDecision === "block",
    )
    .map((detectorResult) => `detector:${detectorResult.type}`);
  const policyBoundary =
    result.policyProfile?.decision === "block" &&
    result.policyProfile.matchedRule
      ? [`policy:${result.policyProfile.id}:${result.policyProfile.matchedRule}`]
      : [];

  return Array.from(new Set([...detectorBoundaries, ...policyBoundary])).sort();
}

function getAuthorityStatus(
  input: ActionGateInput,
  result: Omit<ActionGateResult, "decisionMetadata">,
): DecisionAuthorityStatus {
  if (result.approvalQuality?.issues.includes("missing_approval_authority")) {
    return "unclear";
  }

  if (input.context?.userApproved) {
    return "approved";
  }

  if (result.decision === "require_approval") {
    return "approval_required";
  }

  return "not_required";
}

function getApprovalStatus(
  input: ActionGateInput,
  result: Omit<ActionGateResult, "decisionMetadata">,
): DecisionApprovalStatus {
  if (input.context?.userApproved) {
    return "present";
  }

  if (result.decision === "require_approval") {
    return "required";
  }

  if (result.decision === "allow") {
    return "not_required";
  }

  return "missing";
}

function isRuntimePermitRequired(
  result: Omit<ActionGateResult, "decisionMetadata">,
): boolean {
  return result.decision === "allow";
}

function createReceiptCandidate(args: {
  input: ActionGateInput;
  result: Omit<ActionGateResult, "decisionMetadata">;
  decisionId: string;
  evaluatedAt: string;
  decisionHash: string;
  reasonCodes: AagReasonCode[];
  policyIds: string[];
  hardBoundaryIds: string[];
  runtimePermitRequired: boolean;
  runtimePermitId?: string;
}): ReceiptCandidate {
  return {
    decisionId: args.decisionId,
    actionSummary: summarizeAction(args.input),
    outcome: args.result.decision,
    reasonCodes: args.reasonCodes,
    policyIds: args.policyIds,
    hardBoundaryIds: args.hardBoundaryIds,
    ...(args.input.context?.approvedBy
      ? { approvedBy: args.input.context.approvedBy }
      : {}),
    runtimePermitRequired: args.runtimePermitRequired,
    ...(args.runtimePermitId ? { runtimePermitId: args.runtimePermitId } : {}),
    evaluatedAt: args.evaluatedAt,
    decisionHash: args.decisionHash,
  };
}

function createClosureCandidate(args: {
  input: ActionGateInput;
  result: Omit<ActionGateResult, "decisionMetadata">;
  decisionHash: string;
  reasonCodes: AagReasonCode[];
  policyIds: string[];
  hardBoundaryIds: string[];
  authorityStatus: DecisionAuthorityStatus;
  runtimePermitRequired: boolean;
  runtimePermitId?: string;
}): DecisionClosureCandidate {
  return {
    action: {
      ...(args.input.proposedAction.actionId
        ? { actionId: args.input.proposedAction.actionId }
        : {}),
      actionType: args.input.proposedAction.actionType,
      summary: summarizeAction(args.input),
      toolName: args.input.proposedAction.tool,
      ...(args.input.proposedAction.target
        ? { target: args.input.proposedAction.target }
        : {}),
      ...(getSensitivity(args.input, args.result)
        ? { sensitivity: getSensitivity(args.input, args.result) }
        : {}),
      ...(args.input.proposedAction.reversible !== undefined
        ? { reversibility: args.input.proposedAction.reversible }
        : {}),
    },
    decision: {
      outcome: args.result.decision,
      reason: getDecisionReason(args.result),
      reasonCodes: args.reasonCodes,
      policyIds: args.policyIds,
      hardBoundaryIds: args.hardBoundaryIds,
      humanReviewRequired: args.result.decision === "require_approval",
      ...(args.input.context?.userApproved !== undefined
        ? { humanReviewPresent: args.input.context.userApproved }
        : {}),
    },
    authority: {
      authorityStatus: args.authorityStatus,
      ...(getAuthorityReason(args.result)
        ? { authorityReason: getAuthorityReason(args.result) }
        : {}),
      ...(args.input.context?.reviewerRole
        ? { reviewerRole: args.input.context.reviewerRole }
        : {}),
    },
    executionBoundary: {
      runtimePermitRequired: args.runtimePermitRequired,
      ...(args.runtimePermitId ? { runtimePermitId: args.runtimePermitId } : {}),
    },
    proof: {
      decisionHash: args.decisionHash,
    },
  };
}

function summarizeAction(input: ActionGateInput): string {
  const target = input.proposedAction.target
    ? ` on ${input.proposedAction.target}`
    : "";

  return `${input.proposedAction.actionType} via ${input.proposedAction.tool}${target}`;
}

function summarizeActionForHash(input: ActionGateInput): Record<string, unknown> {
  return {
    actionId: input.proposedAction.actionId,
    tool: input.proposedAction.tool,
    actionType: input.proposedAction.actionType,
    target: input.proposedAction.target,
    payload: input.proposedAction.payload,
    reversible: input.proposedAction.reversible,
    externalFacing: input.proposedAction.externalFacing,
    userRequest: input.userRequest,
    agentPlan: input.agentPlan,
    sourceProfile: input.sourceProfile,
    context: {
      environment: input.context?.environment,
      workflowId: input.context?.workflowId,
      authorizedTargets: input.context?.authorizedTargets,
      authorizedActionTypes: input.context?.authorizedActionTypes,
      userApproved: input.context?.userApproved,
      approvedBy: input.context?.approvedBy,
      reviewerRole: input.context?.reviewerRole,
      runtimePermitId: input.context?.runtimePermitId,
      approvalQuality: input.context?.approvalQuality,
    },
    policyProfileId: input.policyProfileId,
    policyProfile: input.policyProfile,
  };
}

function getDecisionReason(
  result: Omit<ActionGateResult, "decisionMetadata">,
): string {
  return (
    result.policyProfile?.reason ??
    result.evidence[0] ??
    result.recommendedAction
  );
}

function getAuthorityReason(
  result: Omit<ActionGateResult, "decisionMetadata">,
): string | undefined {
  if (result.approvalQuality?.issues.includes("missing_approval_authority")) {
    return "Approval quality metadata did not show valid approval authority.";
  }

  return undefined;
}

function getSensitivity(
  input: ActionGateInput,
  result: Omit<ActionGateResult, "decisionMetadata">,
): "low" | "medium" | "high" | undefined {
  const payloadSensitivity = input.proposedAction.payload?.dataSensitivity;

  if (
    payloadSensitivity === "low" ||
    payloadSensitivity === "medium" ||
    payloadSensitivity === "high"
  ) {
    return payloadSensitivity;
  }

  if (
    result.primaryIssue === "sensitive_data_exposure" ||
    result.primaryIssue === "data_exfiltration" ||
    result.primaryIssue === "credential_access"
  ) {
    return "high";
  }

  if (result.riskLevel === "high" || result.riskLevel === "critical") {
    return "medium";
  }

  return "low";
}

function createDecisionId(decisionHash: string): string {
  return `aag_decision_${decisionHash.replace("sha256:", "").slice(0, 16)}`;
}

function toIsoTimestamp(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
