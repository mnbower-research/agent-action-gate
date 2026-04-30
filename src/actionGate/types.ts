export type GateDecision =
  | "allow"
  | "require_approval"
  | "revise_action"
  | "block";

export type ActionRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type GateDetectorType =
  | "wrong_target"
  | "unauthorized_scope"
  | "missing_approval"
  | "irreversible_action"
  | "sensitive_data_exposure"
  | "tool_mismatch"
  | "objective_drift"
  | "unauthorized_cyber_scope"
  | "credential_access"
  | "data_exfiltration"
  | "privilege_escalation"
  | "supply_chain_modification"
  | "destructive_cyber_action"
  | "unapproved_command_execution";

export type GateSeverity = "low" | "medium" | "high" | "critical";

export type ActionGateInput = {
  userRequest: string;
  agentPlan?: string;
  proposedAction: {
    tool: string;
    actionType: string;
    target?: string;
    payload?: Record<string, unknown>;
    reversible?: boolean;
    externalFacing?: boolean;
  };
  sourceProfile?: {
    systemObjective?: string;
    nonNegotiables?: string[];
    approvalRequiredFor?: string[];
  };
  context?: {
    userApproved?: boolean;
    environment?: "dev" | "staging" | "production";
    workflowId?: string;
    authorizedTargets?: string[];
    authorizedActionTypes?: string[];
  };
};

export type GateDetectorResult = {
  type: GateDetectorType;
  triggered: boolean;
  confidence: number;
  severity: GateSeverity;
  evidence: string[];
  recommendedDecision: GateDecision;
};

export type ActionGateResult = {
  decision: GateDecision;
  riskLevel: ActionRiskLevel;
  primaryIssue: GateDetectorResult["type"] | null;
  confidence: number;
  evidence: string[];
  recommendedAction: string;
  detectorResults: GateDetectorResult[];
};

export type GateDetector = (input: ActionGateInput) => GateDetectorResult;
