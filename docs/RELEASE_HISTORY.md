# Release History

Detailed historical notes moved from the README so the project front page stays focused on the fastest path to understanding and running Agent Action Gate.

## v1.5.0 - Approval Authority Map

This release adds local approval authority context to new receipts.

### Added

- Approval Authority module
- `approvalAuthority` metadata on new receipts
- local authority map support
- authority snapshot hashing
- missing, expired, out-of-scope, and second-approval-required detection
- Distribution Copilot authority metadata
- MetaGate authority metadata
- `aag authority-map`
- Approval Authority Map docs and tests

### Why this matters

v1.4.0 preserved which policy context governed a decision. v1.5.0 preserves whether the approver had valid authority for the action class, target, scope, and risk context.

This is not IAM, authentication, enterprise identity integration, multi-gate routing, signing, or a full permissions platform.

## v1.4.0 - Policy Provenance

This release adds policy context provenance to new receipts.

### Added

- Policy Provenance module
- `policyProvenance` metadata on new receipts
- policy source classification
- policy snapshot hashing
- decision basis capture
- profile, MetaGate, and Distribution Copilot provenance support
- `aag policy-provenance`
- Policy Provenance docs and tests

### Why this matters

v1.3.0 made receipt trails tamper-evident. v1.4.0 preserves which policy context governed the decision when the receipt was created. This helps future reviewers understand not just that a decision happened, but what policy meaning governed it at the time.

This is not approval authority mapping, multi-gate routing, signing, hosted verification, or external notarization.

## v1.3.0 - Receipt Hash Chain

This release adds local tamper-evident receipt chaining.

### Added

- Receipt Hash Chain module
- SHA-256 receipt hashing
- `previousReceiptHash` linkage
- canonical payload hashing
- local receipt-chain verification
- `aag verify-receipts`
- JSON and JSONL receipt verification
- Receipt Hash Chain docs and tests

### Why this matters

AAG already writes local decision receipts. v1.3.0 chains each new receipt to the previous receipt hash so local verification can detect silent alteration of chained receipt history.

This is not signing, blockchain, hosted verification, or external notarization.

## v1.2.0 - Workflow Scope Ledger

This release adds workflow-level scope tracking for agentic action chains.

### Added

- Workflow Scope Ledger module
- Workflow/session intent, allowed scope, and prohibited scope tracking
- Action sequence entries
- Scope warning and scope violation detection
- Cumulative workflow risk
- `aag workflow-start`
- `aag workflow-add-action`
- `aag workflow-status`
- Distribution Copilot workflow attachment support
- Workflow Scope Ledger docs and examples

### Why this matters

A single agent action can be allowed while the overall workflow drifts outside the original intent. The Workflow Scope Ledger begins tracking the chain: original intent, scoped authority, action sequence, decisions, risk flags, and whether the workflow remains in scope.

This is the foundation for reconstructible decision chains in governed agentic workflows.

## v1.1.1 - High-Impact Recommendation Evals

This patch release adds an eval suite for high-impact AI-agent recommendations.

### Added

- High-impact recommendation eval suite
- 20 incident-inspired recommendation-risk cases
- `npm run eval:high-impact`
- focused `highImpactRecommendation` detector support
- README/docs updates for eval coverage

### Why this matters

AAG should not only evaluate direct tool execution. It should also detect risky AI-generated technical guidance that could influence downstream human action, such as advice to bypass approvals, disable security controls, expose credentials, or weaken governance controls.

This is an eval/coverage release, not a new architecture layer.

## v1.1.0 - MetaGate

This release adds MetaGate: a gate for the gate itself.

### Added

- MetaGate evaluation module
- `aag metagate` CLI command
- first-class gating for policy/config governance actions
- MetaGate receipts with `receiptType: "metagate_decision"`
- MetaGate terminal formatter
- audit compatibility for v1.1.0 receipts
- MetaGate examples and docs
- `check-config-change` integration with MetaGate

### Why this matters

AAG gates risky agent actions before execution. MetaGate gates attempts to weaken, disable, or modify the controls that govern AAG itself.

This moves Agent Action Gate toward recursive governance infrastructure: oversight for the oversight layer.

## v1.0.0 - Locked Policy Mode

This release adds locked policy mode and governance change receipts.

### Added

- `locked` support in effective AAG config
- lock metadata: `lockReason`, `lockedAt`, `lockedBy`
- `aag lock-status`
- governance weakening detection
- `aag check-config-change`
- governance/config-change receipts
- audit compatibility for v1.0.0 receipts
- examples for locked, weakened, and benign config changes

### Why this matters

AAG can now detect when its own policy/config governance is locked and can escalate risky attempts to weaken the gate. This creates the foundation for MetaGate, where policy/config changes become first-class gated actions.

## v0.9.0 - Audit Foundation

This release adds audit metadata and receipt verification.

### Added

- `configHash` and `policyHash` in receipts
- `receiptVersion`
- normalized `createdAt` timestamps
- `aag audit` CLI command
- basic receipt validation
- audit report formatter

### Why this matters

AAG can now show which policy and config state were active when a decision receipt was written. This creates the foundation for locked policies, MetaGate, and future tamper-evident receipt chains.
