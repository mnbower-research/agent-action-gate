# CLI

Agent Action Gate can be run locally from the command line.

## Demo

```bash
npx agent-action-gate demo
```

Runs the Launch Copilot demo and prints gate decisions, Review Packets, Policy Profile metadata, and local receipt output.

## Evaluate an action

```bash
npx agent-action-gate evaluate examples/actions/send-email.json --profile strict-external-actions
```

Evaluates one proposed action JSON file before execution.

The CLI writes a receipt by default. The local repository command also accepts the explicit receipt flag:

```bash
npx . evaluate examples/actions/delete-record.json --write-receipt
```

## Audit receipts

```bash
npx agent-action-gate audit
```

Local repository usage:

```bash
npx . audit
```

v0.9.0 adds audit verification. Each new receipt includes `receiptVersion`, normalized `createdAt`, `configHash`, `policyHash`, and `decision`.

The audit command scans `.aag/receipts/` by default and verifies that receipts contain the required audit fields and basic integrity markers. It detects missing audit fields, malformed SHA-256 hashes, malformed timestamps, and invalid JSON receipt files.

This is a tamper-evident foundation for future locked policies and MetaGate. It is basic receipt verification, not cryptographic signing and not tamper-proof security.

Example success:

```txt
AAG Audit

Receipts scanned: 3
Passed: 3
Failed: 0

AUDIT PASS
```

Example failure:

```txt
AAG Audit

Receipts scanned: 3
Passed: 2
Failed: 1

Failures:
- receipts/abc.json
  - missing policyHash
  - malformed createdAt

AUDIT FAIL
```

## Profiles

- `default`
- `launch-copilot`
- `strict-external-actions`

## Receipts

CLI receipts are written locally to `.aag/receipts/`.

Receipts are local audit-style evidence. They do not upload anywhere.

New v0.9.0 receipts include the effective config and policy hashes that were active when the receipt was written.

## Exit codes

`0` means the CLI ran successfully.

A `block` decision is not an error.

For `audit`, `0` means all scanned receipts passed. Non-zero means one or more receipts failed verification.

For other commands, non-zero means invalid input, invalid JSON, unknown profile, or internal CLI failure.

## Example workflow

```bash
npx agent-action-gate demo
npx agent-action-gate evaluate examples/actions/send-email.json --profile strict-external-actions
npx agent-action-gate audit
```
