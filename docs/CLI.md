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

This is a tamper-evident foundation for locked policies and MetaGate. It is basic receipt verification, not cryptographic signing or a security guarantee. v1.0.0 governance receipts and v1.1.0 MetaGate receipts remain audit-compatible with these required fields.

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

## Locked Policy Mode

v1.0.0 introduces locked policy mode. When locked mode is active, risky attempts to weaken policy/config governance can be detected and escalated before they silently reduce gate coverage.

## Lock status

```bash
npx agent-action-gate lock-status
```

Local repository usage:

```bash
npx . lock-status
```

By default, this loads the effective config from `.aag/config.json` if present. If no config exists, `locked` defaults to `false`.

Example unlocked output:

```txt
AAG Lock Status

Locked: false
Config Hash: sha256:...
Policy Hash: sha256:...
```

Example locked output:

```txt
AAG Lock Status

Locked: true
Reason: Production safety policy active
Locked At: 2026-05-06T00:00:00.000Z
Locked By: security-admin
Config Hash: sha256:...
Policy Hash: sha256:...
```

## Check config changes

```bash
npx agent-action-gate check-config-change --before examples/config/locked-before.json --after examples/config/weakened-after.json --write-receipt
```

Local repository usage:

```bash
npx . check-config-change --before examples/config/locked-before.json --after examples/config/weakened-after.json --write-receipt
```

The command loads the before and after config files, checks whether locked mode is active in the before config, detects simple governance weakening, and prints a governance decision.

It currently detects focused v1.0.0 cases such as disabling AAG, disabling receipts, changing `locked` from true to false, changing `defaultDecision` to `allow`, weakening approval requirements, removing detectors, adding broad allowlists, reducing audit visibility, and deleting or ignoring receipt directories.

Example:

```txt
AAG Governance Check

Locked: true
Decision: require_approval
Detected: governanceWeakening
Change: defaultDecision changed to allow.

Receipt written: .aag/receipts/...
```

Benign metadata-only config changes are allowed.

## MetaGate

MetaGate is a gate for the gate itself.

AAG gates risky agent actions. MetaGate gates attempts to weaken, disable, or modify the policy/config controls that govern AAG.

```bash
npx agent-action-gate metagate --action disable_gate --target aag.config.json
```

Local repository usage:

```bash
npx . metagate --action disable_gate --target aag.config.json
```

More examples:

```bash
npx agent-action-gate metagate --action unlock_policy --target aag.config.json --write-receipt
npx agent-action-gate metagate --action modify_policy --target aag.config.json --before examples/config/locked-before.json --after examples/config/weakened-after.json --write-receipt
```

Supported options:

- `--action <actionType>`
- `--target <target>`
- `--before <path>`
- `--after <path>`
- `--requested-by <name>`
- `--reason <text>`
- `--write-receipt`

MetaGate evaluates governance-sensitive actions including `modify_policy`, `modify_config`, `disable_gate`, `unlock_policy`, `disable_receipts`, `disable_audit`, `delete_receipt`, `add_allowlist`, `change_default_decision`, `remove_detector`, and `weaken_sensitive_action_rule`.

Example:

```txt
AAG MetaGate

Action: disable_gate
Target: aag.config.json
Locked: true
Decision: block

Detected:
- metaGate
- disableGateWhileLocked

Reasons:
- AAG is locked.
- Disabling the gate while locked is blocked.

Receipt written: .aag/receipts/...
```

MetaGate builds on locked policy mode and governance receipts. It is a recursive governance layer: oversight for oversight controls. It does not implement cryptographic signing, Sigstore, hosted governance, auth, or a database.

## High-Impact Recommendation Evals

```bash
npm run eval:high-impact
```

These evals check whether AAG escalates risky AI-generated technical recommendations, such as advice to bypass approvals, disable security controls, expose credentials, or weaken governance controls.

The cases are incident-inspired recommendation-risk evals. They are not a claim about any specific company incident.

## Profiles

- `default`
- `launch-copilot`
- `strict-external-actions`

## Receipts

CLI receipts are written locally to `.aag/receipts/`.

Receipts are local audit-style evidence. They do not upload anywhere.

New receipts include the effective config and policy hashes that were active when the receipt was written.

Governance receipts use `receiptType: "governance_change"` and include `governanceChangeType`, `previousConfigHash`, `nextConfigHash`, `locked`, optional lock metadata, and `detectorsTriggered`. These config-change receipts are audit-compatible.

MetaGate receipts use `receiptType: "metagate_decision"` and include `metaGate: true`, `actionType`, `target`, `locked`, optional requester context, `detectorsTriggered`, and `reasons`. These receipts are audit-compatible.

## Exit codes

`0` means the CLI ran successfully.

A `block` decision is not an error.

For `audit`, `0` means all scanned receipts passed. Non-zero means one or more receipts failed verification.

For `lock-status`, `0` means the effective config was loaded and printed.

For `check-config-change`, `0` means the governance check ran and printed a decision. A `require_approval` or `block` governance decision is not a CLI execution error.

For `metagate`, `0` means the MetaGate decision was `allow` or `require_approval`. A `block` decision exits non-zero.

For other commands, non-zero means invalid input, invalid JSON, unknown profile, or internal CLI failure.

## Example workflow

```bash
npx agent-action-gate demo
npx agent-action-gate evaluate examples/actions/send-email.json --profile strict-external-actions
npx agent-action-gate audit
npx agent-action-gate lock-status
npx agent-action-gate check-config-change --before examples/config/locked-before.json --after examples/config/weakened-after.json --write-receipt
npx agent-action-gate metagate --action disable_gate --target aag.config.json --write-receipt
```
