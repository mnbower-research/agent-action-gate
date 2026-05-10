# Multi-Gate Registry

Many specialized gates, one invariant.

The Governance Gate Invariant remains:

> "No external signal becomes internal consequence without authorized discernment."

Expanded direction:

> "Consequence must not outrun authorized discernment."

## Why This Exists

AAG v1.7.0 begins the routing layer for specialized action gates. The core decision model stays the same:

- `allow`
- `require_approval`
- `revise_action`
- `block`

Different action classes carry different risks. Sending an email, exporting data, deploying code, issuing a refund, publishing a public claim, modifying policy, and scoring an employee should not all be routed through the same policy context.

The Multi-Gate Registry keeps the same AAG invariant while making the first routing decision explicit and inspectable.

## How Routing Works

The registry inspects the proposed action:

- `proposedAction.actionType`
- `proposedAction.tool`
- `proposedAction.target`
- `proposedAction.payload`
- request text and context when useful

It returns a deterministic route:

- `gateId`
- `category`
- `reason`
- `matchedSignals`
- `confidence`

The route does not replace the existing detectors, policy profiles, Review Packets, receipts, MetaGate, or audit tooling. It adds explainable metadata about which specialized gate profile should frame the action.

## Default Gates

### Email Gate

Routes external email and message actions such as `send_email`, `reply_email`, `forward_email`, and `external_message`.

Primary focus: authorization, scope, human judgment, and proof.

### Data Export Gate

Routes data export, download, dump, transfer, and upload actions.

Primary focus: scope, accountability, human judgment, and proof.

### Deployment Gate

Routes deploy, release, merge, and CI/CD modification actions.

Primary focus: authorization, reversibility, accountability, and proof.

### Cyber Gate

Routes terminal, shell, network scan, secret access, permission, and infrastructure-risk actions.

Primary focus: authorization, scope, reversibility, and proof.

### Marketing Gate

Routes public posting, social media, campaigns, and external outreach.

Primary focus: authorization, human judgment, accountability, and proof.

### Finance Gate

Routes refunds, invoices, price changes, money transfers, and payment approvals.

Primary focus: authorization, reversibility, accountability, and proof.

### Legal Gate

Routes contract, legal claim, terms, and compliance-claim actions.

Primary focus: authorization, human judgment, accountability, and proof.

### HR Gate

Routes employee scoring, discipline, performance review, termination, and scheduling actions.

Primary focus: authorization, scope, human judgment, accountability, and proof.

### MetaGate

Routes gate, policy, config, receipt deletion, and default-decision changes.

Primary focus: authorization, accountability, human judgment, and proof.

### Default Action Gate

Fallback for actions that do not match a specialized route.

Primary focus: all Six Gate Questions.

## Six Gate Questions

Every gate still answers the same six questions:

1. Is this action authorized?
2. Is it within scope?
3. Is it reversible?
4. Who is accountable?
5. Does it require human judgment?
6. What proof remains?

The registry changes which gate profile frames the action. It does not change the decision vocabulary or the Governance Gate Invariant.

## CLI Usage

Fresh-clone local usage:

```bash
npm run cli -- route examples/actions/send-email.json
```

Direct local usage:

```bash
tsx src/cli.ts route examples/actions/send-email.json
```

The command prints the action name, action type, tool, target, selected gate, category, routing reason, matched signals, and confidence. It does not write receipts.

## Evals

Run:

```bash
npm run eval:gates
```

The eval suite checks that representative email, data export, deployment, cyber, marketing, finance, legal, HR, MetaGate, and fallback actions route to the expected gate.

## Future Direction

The Multi-Gate Registry prepares AAG for broader Human Agency Infrastructure without changing the current project scope.

Future Recommendation Gate, Memory Gate, and Retrieval Gate work can reuse the same pattern: specialized gates, explicit routing, the same invariant, and proof that consequence did not outrun authorized discernment.

AAG v1.7.0 begins routing for specialized action gates. It does not implement all five Human Agency gates, runtime binding, signed receipts, legal compliance, or enterprise enforcement.
