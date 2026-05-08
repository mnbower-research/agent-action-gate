# Approval Authority Map

Approval Authority Map is the v1.5.0 local authority-context layer for Agent Action Gate receipts.

AAG asks: should this action happen?

Receipts ask: can we prove the decision happened?

Receipt Hash Chain asks: can we verify the receipt trail was not silently altered?

Policy Provenance asks: can we prove which policy context governed the decision?

Approval Authority Map asks: can we prove who had authority to approve this action under this scope and risk context?

## What It Is

Each new receipt can include `approvalAuthority` metadata. This metadata records whether an approver authority was found, whether it was valid at decision time, and whether the authority covered the action type, target, scope, risk level, irreversible status, and external-posting context.

The default local authority map is used when `.aag/authority-map.json` does not exist. It is meant for local development and should be replaced for production workflows.

## Approval Is Not Authority

An approval says someone accepted an action.

Authority says that person or role was allowed to approve that class of action under the relevant target, scope, and risk context.

v1.5.0 preserves that distinction in receipts. Missing or unclear authority does not silently pass.

## Key Fields

`authorityId` identifies the authority rule when one is present.

`authorityDecision` explains the authority result: `valid`, `missing_authority`, `out_of_scope`, `expired`, `requires_second_approval`, or `unknown`.

`authorityValidAtDecision` states whether the authority was valid at the moment the receipt was created.

`allowedActionTypes`, `allowedTargets`, `allowedScopes`, and `allowedRiskLevels` live in the local authority map and define what a given authority can approve.

`authoritySnapshotHash` hashes the canonical authority context used at decision time.

## Relationship To Policy Provenance And Hash Chains

Policy provenance records which policy context governed the decision.

Approval authority records who was allowed to approve the action under that context.

Approval authority is attached before `hashChain` metadata is computed. That means new receipt hashes include the authority metadata. If a chained receipt's authority metadata is edited later, `verify-receipts` can detect the receipt payload hash mismatch.

## Legacy Receipts

Receipts written before v1.5.0 do not include `approvalAuthority` metadata. They remain readable.

The `authority-map` command reports legacy receipts as warnings, not failures. Historical receipts are not rewritten.

## Run Verification

```bash
npx . authority-map
```

Installed package usage:

```bash
npx agent-action-gate authority-map
```

Optional flags:

```bash
npx . authority-map --source receipts
npx . authority-map --source distribution
npx . authority-map --source all
npx . authority-map --json
```

`audit`, `verify-receipts`, `policy-provenance`, and `authority-map` are separate:

- `audit` checks required receipt metadata.
- `verify-receipts` checks hash-chain integrity.
- `policy-provenance` checks policy context coverage and validity.
- `authority-map` checks approval authority coverage and validity.

## What This Does Not Claim

- Not full IAM.
- Not SSO.
- Not user authentication.
- Not legal compliance.
- Not signed authority.
- Not external notarization.
- Not multi-gate routing.
- Not a replacement for IAM, SIEM, sandboxing, least privilege, HR access control, or legal review.
