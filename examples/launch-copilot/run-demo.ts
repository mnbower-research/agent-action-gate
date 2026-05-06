import { runLaunchCopilotDemo } from "../../src/actionGate/launchCopilotDemo";

const run = runLaunchCopilotDemo({
  mode: "example",
  version: "0.8.0",
  printAuditLog: true,
});

if (run.matchedExpected !== run.actions.length) {
  process.exitCode = 1;
}
