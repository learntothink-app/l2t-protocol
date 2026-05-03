// Minimal TypeScript types reflecting the JSON schemas. Hand-written
// rather than generated so the surface stays small; downstream code
// should validate at runtime via Ajv before relying on these.

export type Identifier = string;
export type SemanticVersion = string;

export type VertexType =
  | "concept"
  | "skill"
  | "metaskill"
  | "error"
  | "task"
  | "drill"
  | "probe"
  | "topic";

export type EdgeKind =
  | "requires"
  | "trains"
  | "diagnoses"
  | "error_signature"
  | "meta_helps_learn"
  | "transfer_variant"
  | string; // x_* custom

export type EvaluationPolicy =
  | "AUTO_COMPUTE"
  | "SELF_CHECK_COMPUTE"
  | "SELF_CHECK_PROOF";

export interface Vertex {
  id: Identifier;
  type: VertexType;
  label: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface Hyperedge {
  id: Identifier;
  kind: EdgeKind;
  tail: Identifier[];
  head: Identifier[];
  weight?: number;
  metadata?: Record<string, unknown>;
}

export interface Prerequisite {
  from: Identifier;
  to: Identifier;
}

export interface KnowledgeHypergraph {
  vertices: Vertex[];
  edges: Hyperedge[];
  prerequisites?: Prerequisite[];
  edgeKindWeights?: Record<string, number>;
}

export interface Hint {
  id: Identifier;
  spoilerLevel: number;
  text: string;
  kind?: string;
}

export interface HintLadder {
  hints: Hint[];
}

export interface AnswerSpec {
  kind: string;
  [k: string]: unknown;
}

export interface SearchStep {
  id: Identifier;
  targetLabel: string;
  resultSpec: AnswerSpec;
  evaluationPolicy: EvaluationPolicy;
  thinkingToolIds?: Identifier[];
  solutionTex?: string;
  hintLadder?: HintLadder;
  jStar?: number;
}

export interface Task {
  id: Identifier;
  title?: string;
  statementTex?: string;
  concepts: Identifier[];
  skills: Identifier[];
  steps: SearchStep[];
  hintLadder: HintLadder;
  transferVariantIds?: Identifier[];
  retentionSchedule?: { delaysDays: number[] };
  answerSpec?: AnswerSpec;
  jStar?: number;
  tags?: string[];
}

export interface Probe {
  id: Identifier;
  questionTex?: string;
  targetSkills: Identifier[];
  targetErrors?: Identifier[];
  answerSpec: AnswerSpec;
  infoGainPrior: number;
}

export interface MicroTheory {
  id: Identifier;
  title?: string;
  contentTex: string;
  concepts: Identifier[];
  checkQuestion: Probe | { probeId: Identifier };
  evalPolicy: EvaluationPolicy;
}

export interface Methodology {
  protocolVersion: SemanticVersion;
  methodologyId: Identifier;
  methodologyVersion: SemanticVersion;
  title: string;
  description?: string;
  domain: string;
  audience?: string;
  language?: string;
  knowledgeHypergraph: KnowledgeHypergraph;
  microTheories?: MicroTheory[];
  tasks?: Task[];
  drills?: Task[];
  probes?: Probe[];
  thinkingTools?: Array<{ id: Identifier; name: string; kind: string; contentTex: string }>;
  thinkingSystems?: Array<{ version: number; toolIds: Identifier[] }>;
  customInvariants?: Array<{ id: Identifier; label: string; formula: string; atomicPredicates?: string[] }>;
  reliabilityFunction?: unknown;
  metricsConfig?: unknown;
}
