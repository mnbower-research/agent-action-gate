import type { GateRoute } from "./gates/gateTypes";
import type {
  ApprovalQualityResult,
  ApprovalQualityReviewMetadata,
} from "./approvalQuality/approvalQualityTypes";

export type GateDecision =
  | "allow"
  | "require_approval"
  | "revise_action"
  | "block";

export type PolicyDecision = GateDecision;

export type PolicyRule = {
  actionType: string;
  decision: PolicyDecision;
  reason: string;
  requiresReviewPacket?: boolean;
  saferAlternative?: string;
};

export type PolicyProfile = {
  id: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  defaults?: {
    externalEffect?: PolicyDecision;
    highSensitivityData?: PolicyDecision;
    destructiveAction?: PolicyDecision;
    irreversibleAction?: PolicyDecision;
  };
};

export type PolicyProfileResultMetadata = {
  id: string;
  name: string;
  matchedRule?: string;
  decision?: PolicyDecision;
  reason?: string;
  requiresReviewPacket?: boolean;
  saferAlternative?: string;
};

export type ActionRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type ReviewPacketScope = {
  target?: string;
  affectedSystems?: string[];
  affectedRecords?: string[];
  externalEffect?: boolean;
  dataSensitivity?: "low" | "medium" | "high";
  blastRadius?:
    | "single_record"
    | "single_external_contact"
    | "public"
    | "multi_record"
    | "system_wide";
};

export type ReviewPacketDiffPreview = {
  type:
    | "email"
    | "post"
    | "record_update"
    | "file_change"
    | "delete"
    | "export"
    | "none";
  before?: unknown;
  after?: unknown;
  preview?: string;
};

export type ReviewPacketRollbackPath = {
  available: boolean;
  description: string;
};

// Reviewer question rules by decision:
// allow: "What was allowed, and why was it low risk?"
// require_approval: "Do you approve this exact action with this scope and consequence?"
// revise_action: "What must change before this can be approved?"
// block: "What safer alternative should the agent propose instead?"
export type ReviewPacket = {
  proposedAction: string;
  scope?: ReviewPacketScope;
  diffPreview?: ReviewPacketDiffPreview;
  rollbackPath?: ReviewPacketRollbackPath;
  riskReason: string;
  reviewerQuestion: string;
  saferAlternative?: string;
};

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
  | "unapproved_command_execution"
  | "high_impact_recommendation";

export type GateSeverity = "low" | "medium" | "high" | "critical";

export type ActionGateInput = {
  userRequest: string;
  agentPlan?: string;
  proposedAction: {
    actionId?: string;
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
    approvedBy?: string;
    reviewerRole?: string;
    runtimePermitId?: string;
    approvalQuality?: ApprovalQualityReviewMetadata;
  };
  policyProfile?: PolicyProfile;
  policyProfileId?: string;
};

export type GateDetectorResult = {
  type: GateDetectorType;
  triggered: boolean;
  confidence: number;
  severity: GateSeverity;
  evidence: string[];
  recommendedDecision: GateDecision;
};

export type AagReasonCode =
  | "AAG-ALLOW-SAFE-INTERNAL"
  | "AAG-REQUIRE-APPROVAL-HIGH-SENSITIVITY"
  | "AAG-REQUIRE-APPROVAL-EXTERNAL-ACTION"
  | "AAG-BLOCK-HARD-BOUNDARY"
  | "AAG-BLOCK-IRREVERSIBLE-WITHOUT-APPROVAL"
  | "AAG-REVISE-TO-REVIEW-PACKET"
  | "AAG-BLOCK-SENSITIVE-DATA-EXPOSURE"
  | "AAG-BLOCK-RUNTIME-TARGET-MISMATCH"
  | "AAG-BLOCK-TOOL-MISMATCH"
  | "AAG-ESCALATE-AUTHORITY-UNCLEAR";

export type DecisionAuthorityStatus =
  | "not_required"
  | "approved"
  | "approval_required"
  | "unclear";

export type DecisionApprovalStatus =
  | "not_required"
  | "present"
  | "required"
  | "missing";

export type ReceiptCandidate = {
  decisionId: string;
  actionSummary: string;
  outcome: GateDecision;
  reasonCodes: AagReasonCode[];
  policyIds: string[];
  hardBoundaryIds: string[];
  approvedBy?: string;
  runtimePermitRequired: boolean;
  runtimePermitId?: string;
  evaluatedAt: string;
  decisionHash: string;
};

export type DecisionClosureCandidate = {
  action: {
    actionId?: string;
    actionType: string;
    summary: string;
    toolName?: string;
    target?: string;
    sensitivity?: "low" | "medium" | "high";
    reversibility?: boolean;
  };
  decision: {
    outcome: GateDecision;
    reason: string;
    reasonCodes: AagReasonCode[];
    policyIds: string[];
    hardBoundaryIds: string[];
    humanReviewRequired: boolean;
    humanReviewPresent?: boolean;
  };
  authority: {
    authorityStatus: DecisionAuthorityStatus;
    authorityReason?: string;
    reviewerRole?: string;
  };
  executionBoundary: {
    runtimePermitRequired: boolean;
    runtimePermitId?: string;
  };
  proof: {
    decisionHash: string;
  };
};

export type DecisionMetadata = {
  decisionId: string;
  decisionVersion: "2.1.0";
  evaluatedAt: string;
  decisionHash: string;
  reasonCodes: AagReasonCode[];
  policyIds: string[];
  hardBoundaryIds: string[];
  authorityStatus: DecisionAuthorityStatus;
  approvalStatus: DecisionApprovalStatus;
  runtimePermitRequired: boolean;
  runtimePermitId?: string;
  receiptCandidate?: ReceiptCandidate;
  closureCandidate?: DecisionClosureCandidate;
};

export type ActionGateResult = {
  decision: GateDecision;
  riskLevel: ActionRiskLevel;
  primaryIssue: GateDetectorResult["type"] | null;
  confidence: number;
  evidence: string[];
  recommendedAction: string;
  reviewPacket?: ReviewPacket;
  approvalQuality?: ApprovalQualityResult;
  policyProfile?: PolicyProfileResultMetadata;
  gateRoute?: GateRoute;
  decisionMetadata?: DecisionMetadata;
  detectorResults: GateDetectorResult[];
};

export type GateDetector = (input: ActionGateInput) => GateDetectorResult;
