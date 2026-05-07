import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  createEmptyApprovalState,
  loadDashboardSnapshot,
  readJsonlFile,
} from "../dashboardData";
import {
  loadApprovalState,
  saveApprovalState,
  updateApprovalState,
} from "../dashboardState";

runTest("JSONL parser ignores malformed lines", () => {
  const root = createTempRoot();
  const filePath = path.join(root, "sample.jsonl");

  writeFileSync(filePath, '{"ok":true}\nnot-json\n{"ok":false}\n', "utf8");

  const result = readJsonlFile<Record<string, unknown>>(filePath);

  assert.equal(result.entries.length, 2);
  assert.equal(result.ignoredMalformed, 1);
  assert.equal(result.missing, false);
});

runTest("dashboard state update records approved_for_manual_posting", () => {
  const state = updateApprovalState(createEmptyApprovalState(), {
    itemId: "item_1",
    status: "approved_for_manual_posting",
    opportunity: createDashboardOpportunity("item_1"),
  });

  assert.equal(state.items.item_1?.status, "approved_for_manual_posting");
  assert.equal(state.items.item_1?.source, "linkedin");
  assert.equal(state.items.item_1?.history?.length, 1);
  assert.equal(state.activity[0]?.type, "approval_state_changed");
  assert.match(state.activity[0]?.detail ?? "", /No public action was taken/);
});

runTest("approval state creation works when missing", () => {
  const root = createTempRoot();
  const state = loadApprovalState(root);

  assert.equal(state.version, 1);
  assert.deepEqual(state.items, {});
});

runTest("queue action persists with history", () => {
  const state = updateApprovalState(createEmptyApprovalState(), {
    itemId: "item_queue",
    status: "queued_for_approval",
    note: "Queued from Inbox",
    opportunity: createDashboardOpportunity("item_queue"),
  });

  assert.equal(state.items.item_queue?.status, "queued_for_approval");
  assert.equal(state.items.item_queue?.history?.[0]?.event, "queued_for_approval");
  assert.equal(state.items.item_queue?.history?.[0]?.note, "Queued from Inbox");
});

runTest("approve reject and revise statuses persist", () => {
  const approved = updateApprovalState(createEmptyApprovalState(), {
    itemId: "item_approve",
    status: "approved_for_manual_posting",
  });
  const rejected = updateApprovalState(approved, {
    itemId: "item_reject",
    status: "rejected",
  });
  const revised = updateApprovalState(rejected, {
    itemId: "item_revise",
    status: "needs_revision",
  });

  assert.equal(revised.items.item_approve?.status, "approved_for_manual_posting");
  assert.equal(revised.items.item_reject?.status, "rejected");
  assert.equal(revised.items.item_revise?.status, "needs_revision");
});

runTest("duplicate click does not duplicate history", () => {
  const once = updateApprovalState(createEmptyApprovalState(), {
    itemId: "item_dup",
    status: "queued_for_approval",
  });
  const twice = updateApprovalState(once, {
    itemId: "item_dup",
    status: "queued_for_approval",
  });

  assert.equal(twice.items.item_dup?.history?.length, 1);
  assert.equal(twice.activity.length, 1);
});

runTest("approval state persists locally", () => {
  const root = createTempRoot();
  const state = updateApprovalState(createEmptyApprovalState(), {
    itemId: "item_2",
    status: "needs_revision",
  });
  const filePath = saveApprovalState(state, root);
  const loaded = loadApprovalState(root);

  assert.equal(filePath.endsWith(path.join(".aag", "distribution", "approval-state.json")), true);
  assert.equal(loaded.items.item_2?.status, "needs_revision");
});

runTest("malformed approval state falls back safely", () => {
  const root = createTempRoot();
  const statePath = path.join(root, ".aag", "distribution", "approval-state.json");

  mkdirSync(path.dirname(statePath), { recursive: true });
  writeFileSync(statePath, "{", "utf8");

  const state = loadApprovalState(root);

  assert.equal(state.version, 1);
  assert.deepEqual(state.items, {});
});

runTest("dashboard snapshot uses local records and public copy has no em dash", () => {
  const root = createTempRoot();
  const distributionDir = path.join(root, ".aag", "distribution");

  mkdirSync(distributionDir, { recursive: true });
  writeFileSync(
    path.join(distributionDir, "receipts.jsonl"),
    `${JSON.stringify(createDistributionReceipt())}\n`,
    "utf8",
  );

  const snapshot = loadDashboardSnapshot(createEmptyApprovalState(), {
    rootDir: root,
  });
  const opportunity = snapshot.opportunities[0];

  assert.equal(snapshot.isDemoData, false);
  assert.equal(snapshot.kpis.receiptsWritten, 1);
  assert.ok(opportunity);
  assert.doesNotMatch(opportunity.safeComment ?? "", /—/);
  assert.doesNotMatch(opportunity.safeRepost ?? "", /—/);
  assert.doesNotMatch(opportunity.suggestedCTA ?? "", /—/);
});

runTest("dashboard snapshot reflects approval state", () => {
  const root = createTempRoot();
  const distributionDir = path.join(root, ".aag", "distribution");
  const receipt = createDistributionReceipt();

  mkdirSync(distributionDir, { recursive: true });
  writeFileSync(
    path.join(distributionDir, "receipts.jsonl"),
    `${JSON.stringify(receipt)}\n`,
    "utf8",
  );

  const state = updateApprovalState(createEmptyApprovalState(), {
    itemId: String(receipt.sourceTextHash),
    status: "queued_for_approval",
  });
  const snapshot = loadDashboardSnapshot(state, {
    rootDir: root,
  });

  assert.equal(snapshot.opportunities[0]?.localStatus, "queued_for_approval");
  assert.equal(snapshot.approvals.length, 1);
  assert.equal(snapshot.kpis.awaitingApproval, 1);
});

console.log("Dashboard tests passed.");

function runTest(name: string, test: () => void): void {
  try {
    test();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

function createTempRoot(): string {
  return mkdtempSync(path.join(tmpdir(), "aag-dashboard-"));
}

function createDistributionReceipt(): Record<string, unknown> {
  return {
    decision: "require_approval",
    relevanceScore: 9,
    platform: "linkedin",
    goal: "comment",
    summary: "LinkedIn comment opportunity scored 9/10.",
    whyItMattersToAAG: ["Discusses runtime controls"],
    riskFlags: ["platform_risk", "needs_human_review"],
    whatNotToReveal: ["MetaGate internals"],
    safeComment:
      "Policies need to function inside workflows when agents can influence real actions.",
    safeRepost:
      "Agentic AI changes the risk surface because actions need review before execution.",
    suggestedCTA:
      "Invite a focused conversation about pre-execution oversight for agentic workflows.",
    reviewPacket: {
      proposedAction: "comment_on_post",
      riskLevel: "medium",
      requiresHumanApproval: true,
      approvalReason: "Public product positioning requires manual review.",
    },
    sourceTextHash: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    createdAt: "2026-05-07T00:00:00.000Z",
  };
}

function createDashboardOpportunity(id: string) {
  return {
    id,
    title: "Local governance opportunity",
    sourceType: "LinkedIn post",
    platform: "linkedin",
    goal: "comment",
    age: "1m",
    sourceText: "AI governance needs runtime controls.",
    summary: "Local opportunity",
    whyItMatters: ["Discusses runtime controls"],
    relevanceScore: 9,
    riskFlags: ["platform_risk"],
    riskLevel: "medium" as const,
    decision: "require_approval",
    suggestedAction: "Comment",
    whatNotToReveal: ["MetaGate internals"],
    isDemo: false,
  };
}
