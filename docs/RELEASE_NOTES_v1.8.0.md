# v1.8.0 - Approval Quality Layer

## Summary

This release adds the first foundation for evaluating whether approval had minimum conditions for meaningful oversight.

Approval must not outrun understanding.

The Approval Quality Layer records review-process signals for approval-gated decisions. It helps detect rubber-stamp approval patterns by checking time, context, reviewer engagement, authority, and ability to say no.

This is process metadata. It does not score the moral worth of a reviewer.

## Added

- Approval Quality types
- deterministic approval-quality evaluator
- optional `approvalQuality` metadata on `ActionGateResult`
- CLI `approval-quality` command
- approval-quality eval suite
- approval-quality examples
- Approval Quality Layer docs

## CLI Usage

```bash
npm run cli -- approval-quality examples/approval-quality/high-risk-fast-approval.json
```

## Validation Status

- `npm.cmd run typecheck` passed
- `npm.cmd run eval:action-gate` passed, 19/19
- `npm.cmd run eval:high-impact` passed, 20/20
- `npm.cmd run eval:gates` passed, 10/10
- `npm.cmd run eval:approval-quality` passed, 8/8
- `npm.cmd run test:logging` passed
- `npm.cmd run cli -- demo` passed, 6/6 expected decisions
- `npm.cmd run cli -- evaluate examples/actions/send-email.json --profile strict-external-actions` passed

## Scope Note

This release does not prove human understanding, eliminate automation bias, add an approval dashboard, add enterprise enforcement, or replace HR/legal/compliance review.
