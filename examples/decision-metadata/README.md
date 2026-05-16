# Decision Metadata Examples

These examples show AAG returning `decisionMetadata` as an additive hook for downstream receipts, runtime binding, and decision closure artifacts.

Run one locally:

```bash
npm run cli -- evaluate examples/decision-metadata/external-publish-without-approval.json --profile strict-external-actions
```

The decision result keeps the existing fields and adds:

- `decisionMetadata.reasonCodes`
- `decisionMetadata.decisionHash`
- `decisionMetadata.receiptCandidate`
- `decisionMetadata.closureCandidate`

Included scenarios:

- `safe-internal-action.json`: allow with `AAG-ALLOW-SAFE-INTERNAL`
- `external-publish-without-approval.json`: require approval with `AAG-REQUIRE-APPROVAL-EXTERNAL-ACTION`
- `production-delete.json`: block with hard-boundary metadata
- `irreversible-without-approval.json`: approval/blocking metadata for irreversible action without approval
- `runtime-target-mismatch.json`: block with `AAG-BLOCK-RUNTIME-TARGET-MISMATCH`
