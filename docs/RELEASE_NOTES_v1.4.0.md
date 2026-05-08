# v1.4.0 - Policy Provenance

## Added

- Policy Provenance module
- `policyProvenance` metadata on new receipts
- policy source classification
- policy snapshot hashing
- decision basis capture
- profile, MetaGate, and Distribution Copilot provenance support
- `policy-provenance` CLI command
- tests
- docs

## Compatibility

- Existing legacy receipts remain readable.
- Legacy receipts without `policyProvenance` metadata are warnings, not failures.
- Historical receipts are not rewritten.

## Why This Matters

v1.3.0 made receipt trails tamper-evident. v1.4.0 preserves which policy context governed the decision when the receipt was created. This helps future reviewers understand not just that a decision happened, but what policy meaning governed it at the time.
