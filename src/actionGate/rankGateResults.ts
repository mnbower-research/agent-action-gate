import type {
  GateDecision,
  GateDetectorResult,
  GateDetectorType,
  GateSeverity,
} from "./types";

const decisionRank: Record<GateDecision, number> = {
  block: 4,
  require_approval: 3,
  revise_action: 2,
  allow: 1,
};

const detectorDecision: Record<GateDetectorType, GateDecision> = {
  sensitive_data_exposure: "block",
  wrong_target: "block",
  missing_approval: "require_approval",
  irreversible_action: "require_approval",
  unauthorized_scope: "revise_action",
  tool_mismatch: "revise_action",
  objective_drift: "revise_action",
};

const severityRank: Record<GateSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function rankGateResults(
  detectorResults: GateDetectorResult[],
): GateDetectorResult[] {
  return detectorResults
    .filter((result) => result.triggered)
    .sort((left, right) => {
      const decisionDelta =
        decisionRank[getDetectorDecision(right)] -
        decisionRank[getDetectorDecision(left)];

      if (decisionDelta !== 0) {
        return decisionDelta;
      }

      const severityDelta =
        severityRank[right.severity] - severityRank[left.severity];

      if (severityDelta !== 0) {
        return severityDelta;
      }

      return right.confidence - left.confidence;
    });
}

export function getDetectorDecision(
  detectorResult: Pick<GateDetectorResult, "triggered" | "type">,
): GateDecision {
  return detectorResult.triggered
    ? detectorDecision[detectorResult.type]
    : "allow";
}
