# Human Agency Stack

Human Agency Infrastructure extends the Governance Gate Invariant beyond tool actions.

The expanded invariant is:

> "Consequence must not outrun authorized discernment."

Expanded form:

> "No signal, memory, recommendation, or agent action should become operational consequence without the appropriate authority, scope, contestability, accountability, and proof."

Agent Action Gate v2.1.0 currently implements the Action Gate and Receipt Gate portions of this broader Human Agency Infrastructure direction, plus decision metadata hooks that can feed downstream governance systems. This document describes a future-direction architecture, not a claim that AAG currently implements all five gates.

## Five-Gate Stack

### 1. Memory Gate

Question: What may the system retain?

Risk: poisoned, unauthorized, private, outdated, or unchallengeable retained signal.

### 2. Retrieval Gate

Question: What may the system recall into context?

Risk: hidden context, retrieved misinformation, prompt injection, stale policy, or unauthorized data entering the reasoning path.

### 3. Recommendation Gate

Question: What may the system recommend to humans before downstream consequence?

Risk: high-impact advice, disciplinary recommendations, financial/legal/medical recommendations, approval bypass, irreversible human action.

### 4. Action Gate

Question: What may the system execute?

Risk: tool calls, API calls, emails, deployments, deletes, exports, public posts, database writes.

### 5. Receipt Gate

Question: What proof remains?

Risk: no audit trail, weak local proof, deleted records, unverifiable approvals, missing policy context.

## Current AAG Scope

AAG v2.1.0 focuses on Action Gate and Receipt Gate.

The Action Gate evaluates proposed AI-agent tool actions before execution and returns `allow`, `require_approval`, `revise_action`, or `block`.

The Receipt Gate direction is represented by local receipts, audit metadata, Receipt Hash Chain verification, Policy Provenance, and Approval Authority Map metadata.

AAG v2.1.0 does not yet implement Memory Gate, Retrieval Gate, or Recommendation Gate as standalone gate layers. Those are future directions.

## Why Recommendation Gate Is Likely Next

Not all consequential AI behavior occurs through tool calls.

AI recommendations can influence humans to take irreversible or high-impact action. A model can recommend disabling controls, bypassing approvals, exporting data, changing production systems, or making disciplinary, financial, legal, or medical decisions even if the model never directly executes a tool call.

Recommendation Gate would evaluate high-impact recommendations before they become downstream consequence. It would ask whether the recommendation is within scope, authorized, contestable, accountable, reversible where possible, and supported by proof.

## Relationship To Existing Invariant

Original AAG invariant:

> "No external signal becomes internal consequence without authorized discernment."

Generalized invariant:

> "Consequence must not outrun authorized discernment."

The original invariant remains the framing for Agent Action Gate. The generalized invariant describes the broader Human Agency Infrastructure direction that includes memory, retrieval, recommendation, action, and receipt boundaries.

## Design Principle

> "Score systems, not souls."

Human Agency Infrastructure evaluates whether system behavior preserves agency, authority, contestability, accountability, and proof.

It does not assign moral worth scores to people.
