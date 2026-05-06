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

## Profiles

- `default`
- `launch-copilot`
- `strict-external-actions`

## Receipts

CLI receipts are written locally to `.aag/receipts/`.

Receipts are local audit-style evidence. They do not upload anywhere.

## Exit codes

`0` means the CLI ran successfully.

A `block` decision is not an error.

Non-zero means invalid input, invalid JSON, unknown profile, or internal CLI failure.

## Example workflow

```bash
npx agent-action-gate demo
npx agent-action-gate evaluate examples/actions/send-email.json --profile strict-external-actions
```
