# Decision Metadata

Agent Action Gate v2.1.0 adds structured decision metadata to the evaluation result.

AAG remains a small pre-execution action gate. It answers:

> "May this proposed agent action proceed under the current rules?"

Broader governance stacks ask:

> "Can the whole governance chain prove that delegated agent action remained authorized, bounded, reviewable, runtime-faithful, and accountable?"

AAG is the focused pre-execution action gate. Downstream governance systems can consume its structured decision metadata.

This metadata makes AAG decisions easier to feed into receipts, runtime binding, decision closure artifacts, and external audit/reporting layers. It does not turn AAG into a full auditor system.

## Response Shape

`evaluateAction()` and `POST /evaluate` keep the existing response fields stable and add `decisionMetadata`.

```json
{
  "decision": "require_approval",
  "riskLevel": "high",
  "primaryIssue": "missing_approval",
  "recommendedAction": "Request explicit user approval before execution; primary issue: missing_approval.",
  "decisionMetadata": {
    "decisionId": "aag_decision_...",
    "decisionVersion": "2.1.0",
    "evaluatedAt": "2026-05-16T12:00:00.000Z",
    "decisionHash": "sha256:...",
    "reasonCodes": ["AAG-REQUIRE-APPROVAL-EXTERNAL-ACTION"],
    "policyIds": ["policy:strict-external-actions"],
    "hardBoundaryIds": [],
    "authorityStatus": "approval_required",
    "approvalStatus": "required",
    "runtimePermitRequired": false,
    "receiptCandidate": {},
    "closureCandidate": {}
  }
}
```

## Fields

- `decisionId`: deterministic identifier derived from the decision hash.
- `decisionVersion`: metadata schema version.
- `evaluatedAt`: runtime evaluation timestamp.
- `decisionHash`: SHA-256 hash over the deterministic decision material.
- `reasonCodes`: stable AAG reason codes for the outcome.
- `policyIds`: policy/profile identifiers that influenced the decision.
- `hardBoundaryIds`: detector or policy boundaries that caused blocking decisions.
- `authorityStatus`: whether approval authority is not required, approved, required, or unclear.
- `approvalStatus`: whether approval is present, required, missing, or not required.
- `runtimePermitRequired`: true only for executable `allow` decisions in the current local runtime-binding model.
- `runtimePermitId`: optional downstream permit identifier when the caller already has one.
- `receiptCandidate`: hook object that downstream systems can turn into a receipt.
- `closureCandidate`: hook object that downstream systems can turn into a Decision Closure Artifact.

## Reason Codes

Current deterministic reason codes include:

- `AAG-ALLOW-SAFE-INTERNAL`
- `AAG-REQUIRE-APPROVAL-HIGH-SENSITIVITY`
- `AAG-REQUIRE-APPROVAL-EXTERNAL-ACTION`
- `AAG-BLOCK-HARD-BOUNDARY`
- `AAG-BLOCK-IRREVERSIBLE-WITHOUT-APPROVAL`
- `AAG-REVISE-TO-REVIEW-PACKET`
- `AAG-BLOCK-SENSITIVE-DATA-EXPOSURE`
- `AAG-BLOCK-RUNTIME-TARGET-MISMATCH`
- `AAG-BLOCK-TOOL-MISMATCH`
- `AAG-ESCALATE-AUTHORITY-UNCLEAR`

Codes are derived from detector results, policy-profile matches, approval-quality metadata, and the final decision. They are sorted for stable JSON output.

## Decision Hash

`decisionHash` uses the existing `sha256Stable()` utility with stable object-key ordering.

The hash includes:

- `decisionVersion`
- proposed action snapshot, including `actionId`, tool, action type, target, payload, reversibility, and external-facing flag
- user request, agent plan, source profile, selected context fields, and policy profile input
- final outcome, risk level, primary issue, confidence, evidence, recommended action
- reason codes, policy IDs, hard boundary IDs
- authority status, approval status, runtime permit requirement, and optional runtime permit ID
- gate route summary
- policy profile metadata
- detector result summaries

The hash excludes:

- `evaluatedAt`, because it is generated at runtime
- `decisionId`, because it is derived from the hash
- `receiptCandidate` and `closureCandidate`, because they are downstream packaging hooks
- `decisionHash` itself

Equivalent decision material produces the same hash even when object keys are ordered differently.

## Receipt Candidate

`receiptCandidate` is not a full receipt chain. It is a candidate object for downstream receipt systems.

Minimum fields:

- `decisionId`
- `actionSummary`
- `outcome`
- `reasonCodes`
- `policyIds`
- `hardBoundaryIds`
- optional `approvedBy`
- `runtimePermitRequired`
- optional `runtimePermitId`
- `evaluatedAt`
- `decisionHash`

Signed receipts, receipt hash chains, protected key management, and external append-only storage remain separate layers.

## Closure Candidate

`closureCandidate` is not a full Decision Closure Artifact package. It is a clean candidate object that downstream governance systems can package.

It contains:

- `action`: action identity, type, summary, tool, target, sensitivity, and reversibility
- `decision`: outcome, reason, reason codes, policies, hard boundaries, and review status
- `authority`: authority status, optional reason, and optional reviewer role
- `executionBoundary`: runtime permit requirement and optional permit ID
- `proof`: decision hash

## Examples

Input examples live in `examples/decision-metadata/`.

```bash
npm run cli -- evaluate examples/decision-metadata/safe-internal-action.json
npm run cli -- evaluate examples/decision-metadata/external-publish-without-approval.json --profile strict-external-actions
npm run cli -- evaluate examples/decision-metadata/production-delete.json --profile strict-external-actions
npm run cli -- evaluate examples/decision-metadata/irreversible-without-approval.json --profile strict-external-actions
npm run cli -- evaluate examples/decision-metadata/runtime-target-mismatch.json --profile strict-external-actions
```

## Boundaries

AAG is not a full auditor system. It does not replace IAM, receipts, runtime binding, legal review, policy authoring, approval quality, or full governance audits.

AAG can serve as one runtime enforcement component underneath broader governance stacks by producing stable decision evidence before execution.
