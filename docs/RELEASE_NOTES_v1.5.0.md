# v1.5.0 - Approval Authority Map

## Added

- Approval Authority module
- `approvalAuthority` metadata on new receipts
- local authority map support
- authority snapshot hashing
- authority validity checks
- missing, expired, out-of-scope, and second-approval-required authority detection
- Distribution Copilot authority metadata
- MetaGate authority metadata
- `authority-map` CLI command
- tests
- docs

## Compatibility

- Existing legacy receipts remain readable.
- Legacy receipts without `approvalAuthority` metadata are warnings, not failures.
- Historical receipts are not rewritten.

## Why This Matters

v1.4.0 preserved which policy context governed a decision. v1.5.0 preserves whether the approver had valid authority for the action class, target, scope, and risk context. This helps distinguish historical approval from active authority.
