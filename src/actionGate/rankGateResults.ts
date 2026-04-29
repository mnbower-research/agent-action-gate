import type { GateDetectorResult, GateSeverity } from "./types";

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
      const severityDelta =
        severityRank[right.severity] - severityRank[left.severity];

      if (severityDelta !== 0) {
        return severityDelta;
      }

      return right.confidence - left.confidence;
    });
}
