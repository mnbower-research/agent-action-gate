import { strict as assert } from "node:assert";
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { auditReceipts } from "../auditReceipts";
import { evaluateAction } from "../evaluateAction";
import { defaultPolicyProfile } from "../policyProfiles";
import { sha256Stable } from "../stableHash";
import type { ActionGateInput } from "../types";
import { writeEvaluationReceipt } from "../writeReceipt";

const validHash = `sha256:${"a".repeat(64)}`;
const validPolicyHash = `sha256:${"b".repeat(64)}`;

runTest("stable hashing ignores object key order", () => {
  const left = sha256Stable({
    action: "send_email",
    nested: {
      b: true,
      a: ["one", "two"],
    },
  });
  const right = sha256Stable({
    nested: {
      a: ["one", "two"],
      b: true,
    },
    action: "send_email",
  });

  assert.equal(left, right);
  assert.match(left, /^sha256:[a-f0-9]{64}$/);
});

runTest("written receipts include v0.9.0 audit metadata", () => {
  const receiptsDir = createTempDir();
  const input = createActionInput();
  const result = evaluateAction(input, {
    policyProfile: defaultPolicyProfile,
  });

  const receiptPath = writeEvaluationReceipt({
    command: "evaluate",
    input,
    result,
    reason: result.recommendedAction,
    humanDecision: "not_required",
    finalOutcome: "not_executed",
    policyProfile: defaultPolicyProfile,
    receiptDirectory: receiptsDir,
  });
  const receipt = JSON.parse(readFileSync(receiptPath, "utf8")) as Record<
    string,
    unknown
  >;

  assert.equal(receipt.receiptVersion, "0.9.0");
  assert.equal(typeof receipt.createdAt, "string");
  assert.match(String(receipt.configHash), /^sha256:[a-f0-9]{64}$/);
  assert.match(String(receipt.policyHash), /^sha256:[a-f0-9]{64}$/);
  assert.equal(receipt.decision, result.decision);
  assert.equal(receipt.gateDecision, result.decision);
});

runTest("valid receipts pass audit", () => {
  const receiptsDir = createTempDir();
  writeReceipt(receiptsDir, "valid.json", createValidReceipt());

  assert.deepEqual(auditReceipts({ receiptsDir }), {
    scanned: 1,
    passed: 1,
    failed: 0,
    failures: [],
  });
});

runTest("missing audit fields fail audit", () => {
  const receiptsDir = createTempDir();
  writeReceipt(receiptsDir, "missing.json", {
    receiptVersion: "0.9.0",
    createdAt: "2026-05-06T00:00:00.000Z",
    configHash: validHash,
    decision: "allow",
  });

  const result = auditReceipts({ receiptsDir });

  assert.equal(result.failed, 1);
  assert.deepEqual(result.failures[0]?.issues, ["missing policyHash"]);
});

runTest("malformed hashes fail audit", () => {
  const receiptsDir = createTempDir();
  writeReceipt(receiptsDir, "bad-hash.json", {
    ...createValidReceipt(),
    configHash: "sha256:not-a-real-hash",
  });

  const result = auditReceipts({ receiptsDir });

  assert.equal(result.failed, 1);
  assert.deepEqual(result.failures[0]?.issues, ["malformed configHash"]);
});

runTest("invalid JSON receipt files fail audit", () => {
  const receiptsDir = createTempDir();
  writeFileSync(path.join(receiptsDir, "invalid.json"), "{", "utf8");

  const result = auditReceipts({ receiptsDir });

  assert.equal(result.scanned, 1);
  assert.equal(result.failed, 1);
  assert.deepEqual(result.failures[0]?.issues, [
    "invalid JSON receipt file",
  ]);
});

runTest("malformed timestamps fail audit", () => {
  const receiptsDir = createTempDir();
  writeReceipt(receiptsDir, "bad-timestamp.json", {
    ...createValidReceipt(),
    createdAt: "2026-05-06",
  });

  const result = auditReceipts({ receiptsDir });

  assert.equal(result.failed, 1);
  assert.deepEqual(result.failures[0]?.issues, ["malformed createdAt"]);
});

console.log("Audit foundation tests passed.");

function runTest(name: string, test: () => void): void {
  try {
    test();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

function createTempDir(): string {
  return mkdtempSync(path.join(tmpdir(), "aag-audit-foundation-"));
}

function writeReceipt(
  receiptsDir: string,
  filename: string,
  receipt: Record<string, unknown>,
): void {
  writeFileSync(
    path.join(receiptsDir, filename),
    `${JSON.stringify(receipt, null, 2)}\n`,
    "utf8",
  );
}

function createValidReceipt(): Record<string, unknown> {
  return {
    receiptVersion: "0.9.0",
    createdAt: "2026-05-06T00:00:00.000Z",
    configHash: validHash,
    policyHash: validPolicyHash,
    decision: "allow",
  };
}

function createActionInput(): ActionGateInput {
  return {
    userRequest: "Send a short status email.",
    proposedAction: {
      tool: "email",
      actionType: "send_email",
      target: "teammate@example.test",
      payload: {
        subject: "Status",
        body: "Done.",
      },
      reversible: false,
      externalFacing: true,
    },
    context: {
      userApproved: true,
      environment: "dev",
    },
  };
}
