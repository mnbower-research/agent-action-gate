import type {
  ActionGateInput,
  ActionGateResult,
  ActionRiskLevel,
  GateDetector,
  GateDetectorResult,
  GateSeverity,
} from "./types";
import { decideGateAction } from "./decideGateAction";
import { rankGateResults } from "./rankGateResults";
import { detectIrreversibleAction } from "./detectors/irreversibleAction";
import { detectMissingApproval } from "./detectors/missingApproval";
import { detectObjectiveDrift } from "./detectors/objectiveDrift";
import { detectSensitiveDataExposure } from "./detectors/sensitiveDataExposure";
import { detectToolMismatch } from "./detectors/toolMismatch";
import { detectUnauthorizedScope } from "./detectors/unauthorizedScope";
import { detectWrongTarget } from "./detectors/wrongTarget";

export const actionGateDetectors: GateDetector[] = [
  detectWrongTarget,
  detectUnauthorizedScope,
  detectMissingApproval,
  detectIrreversibleAction,
  detectSensitiveDataExposure,
  detectToolMismatch,
  detectObjectiveDrift,
];

export function evaluateAction(input: ActionGateInput): ActionGateResult {
  const detectorResults = actionGateDetectors.map((detector) =>
    detector(input),
  );
  const rankedResults = rankGateResults(detectorResults);
  const decision = decideGateAction(input, detectorResults);

  return {
    decision,
    riskLevel: getRiskLevel(decision, rankedResults),
    primaryIssue: rankedResults[0]?.type ?? null,
    confidence: getDecisionConfidence(decision, rankedResults),
    evidence: getEvidence(rankedResults),
    recommendedAction: getRecommendedAction(decision, rankedResults),
    detectorResults,
  };
}

function getRiskLevel(
  decision: ActionGateResult["decision"],
  rankedResults: GateDetectorResult[],
): ActionRiskLevel {
  if (decision === "block") {
    return "critical";
  }

  const highestSeverity = rankedResults[0]?.severity;

  if (highestSeverity === "critical") {
    return "critical";
  }

  if (highestSeverity === "high" || decision === "require_approval") {
    return "high";
  }

  if (highestSeverity === "medium" || decision === "revise_action") {
    return "medium";
  }

  return "low";
}

function getDecisionConfidence(
  decision: ActionGateResult["decision"],
  rankedResults: GateDetectorResult[],
): number {
  if (rankedResults.length === 0) {
    return decision === "allow" ? 0.9 : 0.6;
  }

  const totalWeight = rankedResults.reduce(
    (sum, result) => sum + getSeverityWeight(result.severity),
    0,
  );
  const weightedConfidence = rankedResults.reduce(
    (sum, result) =>
      sum + result.confidence * getSeverityWeight(result.severity),
    0,
  );

  return roundConfidence(weightedConfidence / totalWeight);
}

function getEvidence(rankedResults: GateDetectorResult[]): string[] {
  if (rankedResults.length === 0) {
    return ["No detector triggered; the proposed action appears low risk."];
  }

  return rankedResults.flatMap((result) => result.evidence);
}

function getRecommendedAction(
  decision: ActionGateResult["decision"],
  rankedResults: GateDetectorResult[],
): string {
  const primaryIssue = rankedResults[0]?.type;

  if (decision === "allow") {
    return "Proceed with the proposed action.";
  }

  if (decision === "require_approval") {
    return primaryIssue
      ? `Request explicit user approval before execution; primary issue: ${primaryIssue}.`
      : "Request explicit user approval before execution.";
  }

  if (decision === "revise_action") {
    return primaryIssue
      ? `Revise the action so it matches the request and tool constraints; primary issue: ${primaryIssue}.`
      : "Revise the action so it matches the request and tool constraints.";
  }

  return primaryIssue
    ? `Do not execute this action; primary issue: ${primaryIssue}.`
    : "Do not execute this action.";
}

function getSeverityWeight(severity: GateSeverity): number {
  if (severity === "critical") {
    return 4;
  }

  if (severity === "high") {
    return 3;
  }

  if (severity === "medium") {
    return 2;
  }

  return 1;
}

function roundConfidence(confidence: number): number {
  return Math.round(confidence * 100) / 100;
}
