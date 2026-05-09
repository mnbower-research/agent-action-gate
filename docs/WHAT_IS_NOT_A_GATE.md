# What Is Not a Gate

A gate is a boundary layer that can stop, pause, revise, or allow a proposed action before consequence.

Many controls can support governance, but they do not qualify as gates by themselves if they cannot act at the pre-execution boundary.

## Not Sufficient by Themselves

Post-hoc logs are not sufficient because they record what happened after consequence. They can support investigation, but they cannot prevent or pause the action.

Dashboards are not sufficient because visibility is not enforcement. A dashboard can help humans understand activity, but it is not a gate unless it can affect the action before execution.

Policy documents are not sufficient because written rules do not enforce themselves at runtime. A policy becomes gate-relevant only when proposed actions are checked against it before consequence.

Risk scores without enforcement are not sufficient because classification is not control. A high score that cannot stop, pause, or revise an action is advisory only.

Approval flows without authority checks are not sufficient because approval is not the same as valid authority. A gate must distinguish whether the approving person had authority for the action class, target, scope, and risk.

Model refusals alone are not sufficient because they operate inside the model interaction, not necessarily at the tool-action boundary. A tool-capable system still needs a pre-execution control layer for proposed actions.

Monitoring after execution is not sufficient because it observes consequences after they occur. It may detect issues, but it does not preserve discernment before the action.

Generic guardrails with no action boundary are not sufficient because they may shape outputs without controlling tool execution. A gate must evaluate proposed actions where capability becomes consequence.

Human-in-the-loop workflows where the human lacks time, context, or authority are not sufficient because they create the appearance of review without meaningful discernment.

Compliance reports created after harm are not sufficient because documentation after the fact cannot substitute for a pre-execution boundary.

## Control Types

A filter screens input or output. It may reduce unsafe content, but it is not necessarily attached to action execution.

A monitor observes activity. It can detect patterns or incidents, but observation alone does not stop consequence.

A logger records events. It can support audit and reconstruction, but it usually operates after or alongside the event.

A dashboard presents information. It can improve visibility, but it is not enforcement by itself.

An approval form captures a human response. It becomes gate-relevant only when the response is checked for context, authority, and timing before execution.

A gate is a boundary layer that can stop, pause, revise, or allow a proposed action before consequence.

## Related Documents

- [Governance Gate Invariant](GATE_INVARIANT.md)
- [Six Gate Questions](SIX_GATE_QUESTIONS.md)
- [Human Agency Infrastructure](HUMAN_AGENCY_INFRASTRUCTURE.md)
