import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import { evaluateAction } from "../evaluateAction";
import { strictExternalActionsPolicyProfile } from "../policyProfiles";
import type { ActionGateInput } from "../types";

const fixedEvaluatedAt = "2026-05-16T12:00:00.000Z";

runTest("decision metadata exists without removing existing result fields", () => {
  const result = evaluateAction(createSafeInternalInput(), {
    evaluatedAt: fixedEvaluatedAt,
  });

  assert.equal(result.decision, "allow");
  assert.equal(result.riskLevel, "low");
  assert.equal(result.primaryIssue, null);
  assert.ok(Array.isArray(result.evidence));
  assert.ok(Array.isArray(result.detectorResults));
  assert.equal(result.decisionMetadata?.decisionVersion, "2.1.0");
  assert.match(
    result.decisionMetadata?.decisionHash ?? "",
    /^sha256:[a-f0-9]{64}$/,
  );
});

runTest("reason codes are deterministic for safe internal allow", () => {
  const left = evaluateAction(createSafeInternalInput(), {
    evaluatedAt: fixedEvaluatedAt,
  });
  const right = evaluateAction(createSafeInternalInput(), {
    evaluatedAt: fixedEvaluatedAt,
  });

  assert.deepEqual(left.decisionMetadata?.reasonCodes, [
    "AAG-ALLOW-SAFE-INTERNAL",
  ]);
  assert.deepEqual(
    left.decisionMetadata?.reasonCodes,
    right.decisionMetadata?.reasonCodes,
  );
});

runTest("equivalent decisions produce identical decision hashes", () => {
  const left = evaluateAction(createExternalPublishInput(), {
    policyProfile: strictExternalActionsPolicyProfile,
    evaluatedAt: "2026-05-16T12:00:00.000Z",
  });
  const right = evaluateAction(
    {
      context: {
        environment: "production",
        userApproved: false,
      },
      proposedAction: {
        actionId: "act_publish_launch",
        externalFacing: true,
        reversible: true,
        payload: {
          postText: "Launch update is ready for review.",
        },
        target: "linkedin",
        actionType: "publish_public_post",
        tool: "social.post",
      },
      userRequest: "Publish the launch update to LinkedIn.",
    },
    {
      policyProfile: strictExternalActionsPolicyProfile,
      evaluatedAt: "2026-05-16T13:00:00.000Z",
    },
  );

  assert.equal(left.decision, "require_approval");
  assert.equal(
    left.decisionMetadata?.decisionHash,
    right.decisionMetadata?.decisionHash,
  );
  assert.equal(
    left.decisionMetadata?.decisionId,
    right.decisionMetadata?.decisionId,
  );
});

runTest("receipt candidate has downstream receipt hook shape", () => {
  const result = evaluateAction(createExternalPublishInput(), {
    policyProfile: strictExternalActionsPolicyProfile,
    evaluatedAt: fixedEvaluatedAt,
  });
  const receiptCandidate = result.decisionMetadata?.receiptCandidate;

  assert.ok(receiptCandidate);
  assert.equal(receiptCandidate.decisionId, result.decisionMetadata?.decisionId);
  assert.equal(receiptCandidate.actionSummary, "publish_public_post via social.post on linkedin");
  assert.equal(receiptCandidate.outcome, "require_approval");
  assert.ok(
    receiptCandidate.reasonCodes.includes(
      "AAG-REQUIRE-APPROVAL-EXTERNAL-ACTION",
    ),
  );
  assert.ok(receiptCandidate.policyIds.includes("policy:strict-external-actions"));
  assert.equal(receiptCandidate.runtimePermitRequired, false);
  assert.equal(receiptCandidate.evaluatedAt, fixedEvaluatedAt);
  assert.equal(receiptCandidate.decisionHash, result.decisionMetadata?.decisionHash);
});

runTest("closure candidate has decision closure hook shape", () => {
  const result = evaluateAction(createProductionDeleteInput(), {
    policyProfile: strictExternalActionsPolicyProfile,
    evaluatedAt: fixedEvaluatedAt,
  });
  const closureCandidate = result.decisionMetadata?.closureCandidate;

  assert.ok(closureCandidate);
  assert.equal(closureCandidate.action.actionType, "delete_record");
  assert.equal(closureCandidate.action.toolName, "crm.delete");
  assert.equal(closureCandidate.action.target, "production/customer-123");
  assert.equal(closureCandidate.decision.outcome, "block");
  assert.ok(
    closureCandidate.decision.reasonCodes.includes(
      "AAG-BLOCK-HARD-BOUNDARY",
    ),
  );
  assert.ok(closureCandidate.decision.hardBoundaryIds.length > 0);
  assert.equal(closureCandidate.executionBoundary.runtimePermitRequired, false);
  assert.equal(
    closureCandidate.proof.decisionHash,
    result.decisionMetadata?.decisionHash,
  );
});

runTest("runtime target mismatch receives deterministic reason code", () => {
  const result = evaluateAction(createRuntimeTargetMismatchInput(), {
    evaluatedAt: fixedEvaluatedAt,
  });

  assert.equal(result.decision, "block");
  assert.equal(result.primaryIssue, "wrong_target");
  assert.ok(
    result.decisionMetadata?.reasonCodes.includes(
      "AAG-BLOCK-RUNTIME-TARGET-MISMATCH",
    ),
  );
});

runTest("decision metadata examples still evaluate", () => {
  const exampleDir = path.resolve("examples", "decision-metadata");
  const examples = [
    "safe-internal-action.json",
    "external-publish-without-approval.json",
    "production-delete.json",
    "irreversible-without-approval.json",
    "runtime-target-mismatch.json",
  ];

  for (const example of examples) {
    const input = JSON.parse(
      readFileSync(path.join(exampleDir, example), "utf8"),
    ) as ActionGateInput;
    const result = evaluateAction(input, {
      policyProfile:
        example === "safe-internal-action.json"
          ? undefined
          : strictExternalActionsPolicyProfile,
      evaluatedAt: fixedEvaluatedAt,
    });

    assert.ok(result.decisionMetadata?.receiptCandidate);
    assert.ok(result.decisionMetadata?.closureCandidate);
  }
});

console.log("Decision metadata tests passed.");

function runTest(name: string, test: () => void): void {
  try {
    test();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

function createSafeInternalInput(): ActionGateInput {
  return {
    userRequest: "Read the README and summarize setup steps.",
    proposedAction: {
      actionId: "act_safe_readme",
      tool: "filesystem.readFile",
      actionType: "read_file",
      target: "README.md",
      reversible: true,
      externalFacing: false,
    },
    context: {
      environment: "dev",
    },
  };
}

function createExternalPublishInput(): ActionGateInput {
  return {
    userRequest: "Publish the launch update to LinkedIn.",
    proposedAction: {
      actionId: "act_publish_launch",
      tool: "social.post",
      actionType: "publish_public_post",
      target: "linkedin",
      payload: {
        postText: "Launch update is ready for review.",
      },
      reversible: true,
      externalFacing: true,
    },
    context: {
      environment: "production",
      userApproved: false,
    },
  };
}

function createProductionDeleteInput(): ActionGateInput {
  return {
    userRequest: "Remove customer-123 from the CRM.",
    proposedAction: {
      actionId: "act_delete_customer",
      tool: "crm.delete",
      actionType: "delete_record",
      target: "production/customer-123",
      reversible: false,
      externalFacing: false,
    },
    context: {
      environment: "production",
      userApproved: false,
    },
  };
}

function createRuntimeTargetMismatchInput(): ActionGateInput {
  return {
    userRequest: "Email alex@example.com with the status update.",
    proposedAction: {
      actionId: "act_wrong_target",
      tool: "email.send",
      actionType: "send_email",
      target: "jordan@example.com",
      payload: {
        body: "The work is complete.",
      },
      reversible: true,
      externalFacing: true,
    },
    context: {
      environment: "dev",
      userApproved: true,
    },
  };
}
