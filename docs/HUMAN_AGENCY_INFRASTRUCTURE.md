# Human Agency Infrastructure

Human Agency Infrastructure means systems that preserve meaningful human judgment, authority, memory, and accountability inside automated and agentic environments.

Agent Action Gate is a pre-execution layer inside Human Agency Infrastructure. It protects the point where agent capability becomes organizational consequence.

The goal is not to slow all automation. The goal is to prevent consequential action from bypassing the human structures that make action legitimate.

Agents can be messengers. The organization is the castle. The gate is the boundary where outside signal, proposed action, and internal authority meet. The problem is not sending messengers outside the walls. The problem is letting messengers return as kings.

## How AAG Fits

AAG checks proposed tool actions before they run and returns `allow`, `require_approval`, `revise_action`, or `block`. Its v1.6.0 primitives preserve approval context, workflow scope, tamper-evident local receipt chains, policy provenance, approval authority, and governance-weakening detection.

AAG is a minimal reference implementation, not hosted governance or an end-to-end compliance system. It can support human-approval workflows and Article 14-style oversight workflows, but it is not legal advice and does not guarantee compliance.

## Related Documents

- [Governance Gate Invariant](GATE_INVARIANT.md)
- [Six Gate Questions](SIX_GATE_QUESTIONS.md)
- [What Is Not a Gate](WHAT_IS_NOT_A_GATE.md)
