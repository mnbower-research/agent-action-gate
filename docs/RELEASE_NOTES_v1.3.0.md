# v1.3.0 - Receipt Hash Chain

## Added

- Receipt Hash Chain module
- SHA-256 receipt hashing
- `previousReceiptHash` linkage
- canonical payload hashing
- local receipt-chain verification
- `verify-receipts` CLI command
- tests
- docs

## Compatibility

- Existing legacy receipts remain readable.
- Legacy receipts without `hashChain` metadata are warnings, not failures.
- Historical receipts are not rewritten.

## Why This Matters

AAG already writes local decision receipts. v1.3.0 makes new receipts tamper-evident by chaining each new receipt to the previous receipt hash. This helps detect silent alteration of the local receipt trail.
