## v1.2.0 — Workflow Scope Ledger

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
