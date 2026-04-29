import type { ActionGateInput, GateDecision, GateDetectorResult } from "./types";
import { rankGateResults } from "./rankGateResults";

const approvalActionPattern =
  /\b(send|email|message|publish|post|delete|remove|destroy|purge|charge|bill|deploy|release|modify|update|write|edit|rename|move)\b/i;
const destructiveActionPattern =
  /\b(delete|remove|destroy|drop|purge|wipe|erase|terminate|charge|bill|deploy|release)\b/i;

export function decideGateAction(
  input: ActionGateInput,
  detectorResults: GateDetectorResult[],
): GateDecision {
  const rankedResults = rankGateResults(detectorResults);

  const criticalBlock = rankedResults.find((result) => {
    if (result.severity !== "critical") {
      return false;
    }

    if (
      result.type === "wrong_target" ||
      result.type === "sensitive_data_exposure"
    ) {
      return true;
    }

    return result.type === "tool_mismatch" && isDestructiveAction(input);
  });

  if (criticalBlock) {
    return "block";
  }

  const nonNegotiableBlock = rankedResults.find(
    (result) =>
      result.type === "unauthorized_scope" &&
      result.severity === "critical" &&
      result.recommendedDecision === "block",
  );

  if (nonNegotiableBlock) {
    return "block";
  }

  if (requiresApproval(input) && !input.context?.userApproved) {
    return "require_approval";
  }

  if (
    rankedResults.some(
      (result) =>
        result.type === "missing_approval" ||
        result.type === "irreversible_action",
    )
  ) {
    return "require_approval";
  }

  if (
    rankedResults.some(
      (result) =>
        result.type === "tool_mismatch" ||
        result.type === "unauthorized_scope" ||
        result.type === "objective_drift" ||
        result.type === "wrong_target",
    )
  ) {
    return "revise_action";
  }

  if (rankedResults.length === 0) {
    return "allow";
  }

  return rankedResults[0].recommendedDecision;
}

function requiresApproval(input: ActionGateInput): boolean {
  const actionText = [
    input.proposedAction.tool,
    input.proposedAction.actionType,
    input.proposedAction.target,
    stringifyPayload(input.proposedAction.payload),
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/[_-]/g, " ");

  return (
    Boolean(input.proposedAction.externalFacing) ||
    input.proposedAction.reversible === false ||
    input.context?.environment === "production" ||
    approvalActionPattern.test(actionText) ||
    matchesSourceApprovalRule(input, actionText)
  );
}

function isDestructiveAction(input: ActionGateInput): boolean {
  const actionText = [
    input.proposedAction.tool,
    input.proposedAction.actionType,
    input.proposedAction.target,
    stringifyPayload(input.proposedAction.payload),
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/[_-]/g, " ");

  return (
    input.proposedAction.reversible === false ||
    destructiveActionPattern.test(actionText)
  );
}

function matchesSourceApprovalRule(
  input: ActionGateInput,
  actionText: string,
): boolean {
  const rules = input.sourceProfile?.approvalRequiredFor ?? [];
  const normalizedAction = actionText.toLowerCase();

  return rules.some((rule) => {
    const normalizedRule = rule.trim().toLowerCase();
    return normalizedRule.length > 0 && normalizedAction.includes(normalizedRule);
  });
}

function stringifyPayload(payload: Record<string, unknown> | undefined): string {
  if (!payload) {
    return "";
  }

  try {
    return JSON.stringify(payload);
  } catch {
    return "";
  }
}
