# v1.6.1 - Fresh-Clone CLI Stabilization

## Summary

This release stabilizes the unpublished fresh-clone CLI path.

Users can run the local CLI without a global install or npm publishing:

```bash
npm run cli -- demo
npm run cli -- evaluate examples/actions/send-email.json --profile strict-external-actions
npm run cli -- audit
npm run cli -- verify-receipts
```

## Added

- `npm run cli -- ...` package script for local CLI execution.
- `docs/FIVE_MINUTE_DEMO.md` with fresh-clone commands.

## Updated Docs

- `README.md`
- `docs/CLI.md`

## Validation Status

Validated from the working tree:

- `npm.cmd run typecheck` passed
- `npm.cmd run eval:action-gate` passed, 19/19
- `npm.cmd run eval:high-impact` passed, 20/20
- `npm.cmd run test:logging` passed
- `npm.cmd run cli -- demo` passed
- `npm.cmd run cli -- evaluate examples/actions/send-email.json --profile strict-external-actions` passed
- `npm.cmd run cli -- verify-receipts` passed

Validated in an isolated clean copy with no prior `.aag` receipts:

- `npm.cmd install` passed
- `npm.cmd run cli -- demo` passed
- `npm.cmd run cli -- evaluate examples/actions/send-email.json --profile strict-external-actions` passed
- `npm.cmd run cli -- audit` passed
- `npm.cmd run cli -- verify-receipts` passed

## Note

In the existing working tree, `npm.cmd run cli -- audit` reports legacy May 5 receipts that predate required audit metadata. This is not part of the fresh-clone path. A clean clone with only new v1.6.1 receipts passes audit.

## Scope

This release does not add new architecture, hosted governance, cryptographic signing, IAM, or legal compliance guarantees.
