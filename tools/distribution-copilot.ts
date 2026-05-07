import {
  formatDistributionReview,
  loadDistributionInput,
  reviewDistributionInput,
  writeDistributionLogs,
} from "../src/actionGate/distributionCopilot";

function main(): void {
  const inputPath = readInputPath(process.argv.slice(2));
  const input = loadDistributionInput(inputPath);
  const review = reviewDistributionInput(input);
  const logPaths = writeDistributionLogs(review);

  console.log(formatDistributionReview(review, logPaths.receipts));
}

function readInputPath(args: string[]): string {
  const inputFlagIndex = args.indexOf("--input");

  if (inputFlagIndex === -1 || !args[inputFlagIndex + 1]) {
    throw new Error(
      "Usage: tsx tools/distribution-copilot.ts --input path/to/input.json",
    );
  }

  return args[inputFlagIndex + 1];
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
