# Release Notes v2.1.0

## Decision Metadata

v2.1.0 adds structured decision metadata to AAG evaluation results.

AAG answers:

> "May this proposed agent action proceed under the current rules?"

Broader governance stacks ask:

> "Can the whole governance chain prove that delegated agent action remained authorized, bounded, reviewable, runtime-faithful, and accountable?"

AAG is the focused pre-execution action gate. Downstream governance systems can consume its structured decision metadata.

## Added

- additive `decisionMetadata` on `ActionGateResult`
- deterministic reason codes
- stable `decisionHash`
- deterministic `decisionId`
- `policyIds`
- `hardBoundaryIds`
- `authorityStatus`
- `approvalStatus`
- `runtimePermitRequired`
- optional `runtimePermitId`
- `receiptCandidate`
- `closureCandidate`
- decision metadata examples
- decision metadata tests

## Compatibility

Existing result fields remain in place. HTTP `POST /evaluate` returns the same root response fields and now includes `decisionMetadata` as an additive field.

## Boundaries

This release does not add dashboards, hosted APIs, Governance Reality Reports, public-source scanning, broad external audit/reporting business logic, IAM, a full receipt chain, a full Decision Closure Artifact package, legal compliance, regulator approval, or complete AI safety.
