# v1.7.0 - Multi-Gate Registry

## Summary

This release adds the first routing-layer foundation for specialized gates while preserving the Governance Gate Invariant.

Many specialized gates, one invariant.

The core decision model remains:

- `allow`
- `require_approval`
- `revise_action`
- `block`

## Added

- Multi-Gate Registry types
- default gate definitions
- deterministic action-to-gate routing
- optional `gateRoute` metadata on `ActionGateResult`
- CLI `route` command
- gate routing eval suite
- Multi-Gate Registry docs

## Default Gates

- Email Gate
- Data Export Gate
- Deployment Gate
- Cyber Gate
- Marketing Gate
- Finance Gate
- Legal Gate
- HR Gate
- MetaGate
- Default Action Gate

## CLI Usage

```bash
npm run cli -- route examples/actions/send-email.json
```

## Validation Status

- `npm.cmd run typecheck` passed
- `npm.cmd run eval:action-gate` passed, 19/19
- `npm.cmd run eval:high-impact` passed, 20/20
- `npm.cmd run eval:gates` passed, 10/10
- `npm.cmd run test:logging` passed
- `npm.cmd run cli -- demo` passed, 6/6 expected decisions
- `npm.cmd run cli -- evaluate examples/actions/send-email.json --profile strict-external-actions` passed

## Scope Note

This release does not add runtime binding, mandatory proxy enforcement, signed receipts, external append-only verification, IAM, sandboxing, or legal compliance guarantees.
