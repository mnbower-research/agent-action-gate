import path from "node:path";

export const receiptVersion = "0.9.0";
export const defaultReceiptDirectory = path.join(".aag", "receipts");

export type EffectiveAagConfig = {
  project: "agent-action-gate";
  receiptVersion: typeof receiptVersion;
  receiptDirectory: string;
  decisionEngine: "detectors-with-policy-profile";
  detectors: string[];
};

export function createEffectiveAagConfig(options: {
  receiptDirectory?: string;
  detectorIds?: string[];
}): EffectiveAagConfig {
  return {
    project: "agent-action-gate",
    receiptVersion,
    receiptDirectory: options.receiptDirectory ?? defaultReceiptDirectory,
    decisionEngine: "detectors-with-policy-profile",
    detectors: options.detectorIds ?? [],
  };
}
