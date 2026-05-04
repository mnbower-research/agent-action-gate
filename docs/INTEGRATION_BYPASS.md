# Integration Bypass

## Definition

Integration Bypass occurs when an AI system completes cognitive or operational work before a human has meaningfully participated enough to understand, review, revise, approve, or own the outcome.

For AI agents, the most important form is action-loop bypass:

```txt
AI reasons
-> AI selects an action
-> AI executes the action
-> external systems are affected
-> human review happens too late
```

In this failure mode, a human may technically exist somewhere in the organization, but the meaningful decision loop has already closed.

## Plain-Language Version

Chatbots answer questions.

Agents take actions.

Once an AI system can send, delete, update, refund, deploy, publish, export, or trigger workflows, the safety question changes from:

```txt
"Is this answer correct?"
```

to:

```txt
"Should this action be allowed to affect the real world?"
```

Integration Bypass is what happens when that second question is never meaningfully asked before execution.

## Why It Matters

Integration Bypass matters because agentic AI can affect:

- customers
- employees
- private data
- databases
- files
- code
- production systems
- financial workflows
- public communications
- legal or compliance-sensitive processes
- operational reputation

The danger is not only that an AI agent may produce a wrong output.

The danger is that the agent may convert reasoning into external consequence before a human has had a meaningful opportunity to intervene.

## Examples

### Example 1: Customer Email

```txt
Agent drafts a customer email.
Agent decides the email is ready.
Agent sends it automatically.
The message creates legal, reputational, or customer-service risk.
Human review happens after the customer receives it.
```

Integration Bypass occurred because the action crossed the external boundary before review.

### Example 2: Database Mutation

```txt
Agent identifies "unused" records.
Agent deletes them.
The records were actually production data.
Human review happens after data loss.
```

Integration Bypass occurred because the agent executed an irreversible or high-impact action without approval.

### Example 3: Workflow Automation

```txt
Agent triggers an n8n workflow.
The workflow updates CRM records and notifies customers.
The action was based on incomplete context.
The business absorbs the consequence.
```

Integration Bypass occurred because the workflow had external effects before meaningful oversight.

### Example 4: Code Deployment

```txt
Agent modifies code.
Agent deploys to production.
The deployment breaks a customer-facing system.
Human review happens after the outage.
```

Integration Bypass occurred because the AI moved from code suggestion to production action without an action gate.

## The Action Boundary

Agent Action Gate focuses on the action boundary:

```txt
inside the system:
reasoning, drafting, planning, summarizing, proposing

outside the system:
sending, deleting, updating, exporting, refunding, deploying, publishing, triggering APIs
```

The action boundary is the moment where cognition becomes consequence.

That is where oversight must happen.

## How Agent Action Gate Prevents Integration Bypass

Agent Action Gate inserts a checkpoint before external action.

```txt
AI proposes action
-> AAG evaluates risk, scope, permissions, reversibility, and policy
-> AAG returns allow / require_approval / revise_action / block
-> human review occurs when required
-> action executes only if cleared
-> decision is logged
```

This preserves meaningful human participation before high-impact actions affect the world.

Agent Action Gate is pre-execution human oversight infrastructure for AI agents. It translates policy into runtime action control, preventing agents from closing action loops before humans have meaningfully understood, reviewed, or owned the outcome.

## Decision Outcomes

### `allow`

The action is low-risk, within scope, reversible, and consistent with policy.

Example:

```txt
Summarize internal notes.
Update a local draft.
Add a non-sensitive internal note.
```

### `require_approval`

The action may be valid, but it affects external systems, customers, money, data, code, or reputation.

Example:

```txt
Send customer email.
Issue refund.
Update CRM status.
Deploy code.
Export a report.
```

### `revise_action`

The action is directionally acceptable but needs changes before execution.

Example:

```txt
Email tone is too risky.
Scope is too broad.
Action needs narrowed permissions.
Requested data should be minimized.
```

### `block`

The action is unsafe, unauthorized, irreversible, outside scope, or policy-prohibited.

Example:

```txt
Delete production data.
Access credentials.
Exfiltrate private data.
Bypass approval.
Modify security settings without authorization.
```

## What This Is Not

Agent Action Gate does not claim to:

- make AI agents perfectly safe
- guarantee legal compliance
- replace organizational governance
- replace security review
- replace human accountability
- judge whether a business use case is legally high-risk
- prevent every bad outcome
- solve AI alignment in general

It addresses a narrower operational problem:

```txt
AI agents should not take high-impact external actions before meaningful human oversight can occur.
```

Agent Action Gate does not make AI systems safe or compliant by itself. It is a technical control that can support broader governance, risk management, and oversight programs.

## Relationship to PCPI

PCPI stands for Participation in Cognition-Action Process Index.

PCPI asks whether human participation is meaningful or merely symbolic.

A basic approval workflow asks:

```txt
Did a human click approve?
```

PCPI asks:

```txt
Did a human meaningfully participate before the action happened?
```

This matters because a human can technically be "in the loop" while still rubber-stamping actions too quickly to understand them.

Agent Action Gate enforces the checkpoint.

PCPI measures whether the checkpoint preserves real participation.

## Summary

Integration Bypass is the failure mode.

Agent Action Gate is the control layer.

```txt
Failure mode:
AI closes the action loop before human participation.

Control:
AAG gates the action before execution.

Goal:
Preserve meaningful human oversight before AI affects external systems.
```
