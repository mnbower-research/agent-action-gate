# Article 14 Oversight

## Purpose

This document explains how Agent Action Gate can support Article 14-style human oversight for AI-agent workflows.

Agent Action Gate should not be described as making a system compliant with the EU AI Act by itself.

It is a technical control that may support broader governance, risk management, documentation, and oversight processes.

## Article 14 Context

EU AI Act Article 14 concerns human oversight for high-risk AI systems.

At a high level, Article 14 requires high-risk AI systems to be designed and developed so they can be effectively overseen by natural persons during use.

Human oversight is intended to prevent or minimize risks to health, safety, and fundamental rights.

Article 14 also emphasizes that oversight should be appropriate and proportionate to the risks, level of autonomy, and context of use.

Human overseers should be enabled, where appropriate and proportionate, to:

- understand the system's relevant capacities and limitations
- monitor system operation
- detect anomalies, dysfunctions, or unexpected performance
- remain aware of automation bias or over-reliance
- correctly interpret system output
- decide not to use, override, reverse, or disregard output
- intervene in or interrupt operation through a stop procedure or similar mechanism

Note:
This document is not legal advice. Organizations should consult qualified legal and compliance professionals when evaluating EU AI Act obligations.

## The Problem for AI Agents

AI agents create a practical oversight problem because they can move from reasoning to action.

```txt
chatbot:
AI produces an answer

agent:
AI produces an action
```

When an AI agent can affect external systems, oversight after the fact may be too late.

Examples of external actions include:

- sending emails
- updating CRM records
- issuing refunds
- deleting files or records
- exporting customer data
- triggering n8n/Zapier/Make workflows
- using APIs
- modifying code
- deploying software
- changing permissions
- publishing public content
- initiating financial or operational actions

The oversight question becomes:

```txt
Can a human meaningfully review this before the action affects the world?
```

## Integration Bypass

Integration Bypass occurs when an AI agent completes an action loop before a human has meaningfully understood, reviewed, approved, revised, or owned the outcome.

In an Article 14-style oversight context, Integration Bypass is a practical failure mode because oversight may exist on paper while failing at the actual action boundary.

A human-in-the-loop process is not meaningful if the loop has already closed.

## How Agent Action Gate Supports Oversight

Agent Action Gate provides a pre-execution checkpoint.

```txt
AI proposes action
-> AAG evaluates action
-> AAG returns allow / require_approval / revise_action / block
-> human review occurs when required
-> action executes only if cleared
-> decision is logged
```

This supports human oversight by ensuring review can happen before high-impact external effects occur.

Agent Action Gate is pre-execution human oversight infrastructure for AI agents. It translates policy into runtime action control. It does not make AI systems safe or compliant by itself, but can support broader governance, risk management, and oversight programs.

## Mapping to Article 14-Style Oversight Needs

| Oversight Need | Agent Action Gate Support |
| --- | --- |
| Understand system behavior | Provides a human-readable summary of proposed actions and why they are risky |
| Monitor operation | Logs proposed actions, decisions, reviewers, timestamps, and outcomes |
| Detect anomalies | Flags unusual, destructive, unauthorized, or high-impact actions |
| Avoid automation bias | Routes high-impact actions to review instead of silent execution |
| Interpret output/action | Explains what the agent intends to do before it does it |
| Decide not to use output | Supports `block` and `revise_action` decisions |
| Override or interrupt | Stops execution until the action is cleared |
| Proportionate oversight | Allows different handling for low, medium, high, and critical actions |
| Maintain accountability | Creates an audit trail showing who approved, revised, or blocked an action |

## Key Technical Properties

### 1. Pre-Execution Enforcement

Agent Action Gate runs before external action.

No high-impact API call, file write, email send, database mutation, deployment, refund, or workflow trigger should execute until the gate returns an appropriate decision.

### 2. Four Decision Outcomes

AAG returns:

- `allow`
- `require_approval`
- `revise_action`
- `block`

These outcomes give systems more nuance than a simple allow/deny filter.

### 3. Human Approval for High-Impact Actions

Actions affecting customers, data, money, code, permissions, public communication, legal exposure, safety, or production systems can be routed to human review.

### 4. Audit Logging

AAG should log:

- proposed action
- agent intent
- action category
- risk category
- policy triggered
- gate decision
- human reviewer when required
- reviewer decision
- timestamp
- final outcome
- reason or justification

### 5. Fail-Closed Behavior

If the gate cannot evaluate an action, cannot reach required policy context, or cannot create required logs, the safer default is to block or escalate to `require_approval`.

No silent auto-allow for uncertain high-impact actions.

### 6. Bypass Logging

Any emergency override or manual bypass should be logged as a high-severity event with justification.

### 7. Policy Integrity

Gate policies should be versioned, reviewable, and protected from unauthorized modification.

## Scope of Agent Action Gate

Agent Action Gate addresses pre-execution oversight for AI-agent actions.

It does not:

- replace organizational governance
- replace training or accountability structures
- guarantee the safety or correctness of model outputs
- determine whether a use case is high-risk under Annex III
- guarantee EU AI Act compliance
- prevent misuse if human reviewers rubber-stamp approvals
- replace legal, security, privacy, or compliance review
- handle every possible AI safety risk

AAG is a technical control layer.

It protects the action boundary.

## Organizational Requirements

AAG must be deployed with organizational measures.

Human reviewers need:

- enough time
- enough context
- appropriate authority
- appropriate competence
- clear escalation paths
- permission to reject, revise, or block actions
- training on automation bias and over-reliance

AAG does not replace the human overseer.

It protects the conditions under which human oversight can remain meaningful.

## Evidence for Conformity Assessment and Internal Governance

AAG can generate technical artifacts that may support internal governance, audit, and conformity-assessment workflows.

Examples:

### 1. Risk-Based Policy Files

Policy files declare which action classes trigger:

- `allow`
- `require_approval`
- `revise_action`
- `block`

This shows proportionate oversight based on action risk.

### 2. Evaluation Suite

Evals can test whether AAG handles dangerous, ambiguous, or bypass-seeking actions.

Example categories:

- destructive commands
- credential access
- data exfiltration
- unauthorized scope
- tool mismatch
- missing approval
- irreversible actions
- public communication
- production system changes

### 3. Action Logs

Logs record the oversight chain:

```txt
proposed action
-> risk category
-> gate decision
-> human decision
-> final execution state
```

### 4. PCPI Metrics

PCPI stands for **Participatory Capacity Preservation Index**.

PCPI can help measure whether oversight is meaningful rather than symbolic.

In the AAG context, PCPI can track signals such as:

- approval latency
- approval rate
- rejection rate
- revision rate
- override frequency
- repeated one-click approvals
- high-risk actions approved too quickly
- whether reviewers meaningfully interact with the action summary
- whether human reviewers still understand the workflow they are approving

This helps detect rubber-stamping, automation bias, and capacity erosion.

### 5. Policy Version History

Policy versioning helps reconstruct which rules were active when an action was evaluated.

## Example: Customer Support Agent

A company deploys an AI support agent.

Policy:

```txt
AI may draft customer responses.
AI may not send high-risk customer emails without review.
AI may not issue refunds over $100 without manager approval.
AI may not delete customer records.
AI may not export customer data without approval.
```

AAG runtime behavior:

```txt
Draft customer reply -> allow
Send customer reply -> require_approval
Refund $25 -> allow or require_approval depending on policy
Refund $250 -> require_approval with manager review
Delete customer record -> block
Export customer list -> require_approval or block
```

This turns written company policy into runtime action governance.

## Recommended Claim Language

Use:

```txt
Agent Action Gate supports Article 14-style human oversight by enforcing pre-execution review for high-impact AI-agent actions.
```

Use:

```txt
Agent Action Gate provides technical evidence that human oversight occurred before external effects.
```

Use:

```txt
Agent Action Gate is human oversight infrastructure for agentic AI workflows.
```

Do not use:

```txt
Agent Action Gate guarantees EU AI Act compliance.
```

Do not use:

```txt
Agent Action Gate makes any AI system legally compliant.
```

Do not use:

```txt
Agent Action Gate satisfies Article 14 by itself.
```

## Summary

Article 14 emphasizes effective human oversight.

AI agents make this harder because they can act before humans meaningfully participate.

Agent Action Gate supports oversight by placing a runtime checkpoint before external action.

```txt
Legal/regulatory need:
Effective human oversight

Technical failure mode:
Integration Bypass

Control:
Pre-execution Agent Action Gate

Evidence:
Logs, policy files, evals, PCPI metrics
```
