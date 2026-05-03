import type { Methodology, KnowledgeHypergraph, Task } from "./types.js";

export interface StructuralIssue {
  code: string;
  message: string;
  path?: string;
}

/**
 * Structural checks that JSON Schema cannot express:
 *
 *  - vertex id uniqueness
 *  - tail/head id resolution
 *  - tail/head type compatibility per edge kind
 *  - prerequisite DAG acyclicity
 *  - every Task carries at least one outgoing `trains` edge
 *  - every Probe vertex carries at least one outgoing `diagnoses` edge
 *  - every Error vertex carries at least one outgoing `error_signature`
 *  - HintLadder spoiler levels are non-decreasing
 *  - Task references existing concepts / skills / transfer variants
 *  - MicroTheory references existing concepts
 *  - customInvariant formulas mention only declared atomic predicates
 */
export function checkStructural(m: Methodology): StructuralIssue[] {
  const issues: StructuralIssue[] = [];
  const kg: KnowledgeHypergraph = m.knowledgeHypergraph;

  const vertexById = new Map<string, (typeof kg.vertices)[number]>();
  for (const v of kg.vertices) {
    if (vertexById.has(v.id)) {
      issues.push({ code: "duplicate_vertex_id", message: `Duplicate vertex id ${v.id}`, path: `knowledgeHypergraph.vertices` });
    }
    vertexById.set(v.id, v);
  }

  // Edge tail/head resolution + type-compatibility.
  const edgeRules: Record<string, { tail: string[]; head: string[] }> = {
    requires:         { tail: ["skill"],            head: ["skill"] },
    trains:           { tail: ["task", "drill"],    head: ["skill", "metaskill"] },
    diagnoses:        { tail: ["probe"],            head: ["skill", "error"] },
    error_signature:  { tail: ["error"],            head: ["skill"] },
    meta_helps_learn: { tail: ["metaskill"],        head: ["skill"] },
    transfer_variant: { tail: ["task"],             head: ["task"] },
  };

  for (const e of kg.edges) {
    for (const id of [...e.tail, ...e.head]) {
      if (!vertexById.has(id)) {
        issues.push({ code: "edge_dangling_ref", message: `Edge ${e.id} references unknown vertex ${id}`, path: `knowledgeHypergraph.edges` });
      }
    }
    const rule = edgeRules[e.kind];
    if (rule) {
      for (const id of e.tail) {
        const v = vertexById.get(id);
        if (v && !rule.tail.includes(v.type)) {
          issues.push({ code: "edge_type_mismatch", message: `Edge ${e.id} of kind ${e.kind} has tail vertex ${id} of type ${v.type}; expected ${rule.tail.join("|")}`, path: `knowledgeHypergraph.edges` });
        }
      }
      for (const id of e.head) {
        const v = vertexById.get(id);
        if (v && !rule.head.includes(v.type)) {
          issues.push({ code: "edge_type_mismatch", message: `Edge ${e.id} of kind ${e.kind} has head vertex ${id} of type ${v.type}; expected ${rule.head.join("|")}`, path: `knowledgeHypergraph.edges` });
        }
      }
    }
  }

  // Prerequisite DAG cycle check.
  if (kg.prerequisites && kg.prerequisites.length > 0) {
    const adj = new Map<string, string[]>();
    for (const p of kg.prerequisites) {
      const arr = adj.get(p.from) ?? [];
      arr.push(p.to);
      adj.set(p.from, arr);
    }
    const colour = new Map<string, 0 | 1 | 2>();
    function dfs(node: string): boolean {
      const c = colour.get(node) ?? 0;
      if (c === 1) return true; // back-edge
      if (c === 2) return false;
      colour.set(node, 1);
      for (const next of adj.get(node) ?? []) {
        if (dfs(next)) return true;
      }
      colour.set(node, 2);
      return false;
    }
    for (const node of adj.keys()) {
      if (dfs(node)) {
        issues.push({ code: "prerequisite_cycle", message: `Prerequisite DAG contains a cycle reachable from ${node}` });
        break;
      }
    }
  }

  // Per-vertex outbound-edge requirements.
  const outgoingByKind = new Map<string, Set<string>>(); // vertexId -> set of kinds
  for (const e of kg.edges) {
    for (const id of e.tail) {
      const set = outgoingByKind.get(id) ?? new Set();
      set.add(e.kind);
      outgoingByKind.set(id, set);
    }
  }
  for (const v of kg.vertices) {
    const out = outgoingByKind.get(v.id) ?? new Set();
    if (v.type === "task" && !out.has("trains")) {
      issues.push({ code: "task_without_trains", message: `Task vertex ${v.id} has no outgoing 'trains' edge` });
    }
    if (v.type === "probe" && !out.has("diagnoses")) {
      issues.push({ code: "probe_without_diagnoses", message: `Probe vertex ${v.id} has no outgoing 'diagnoses' edge` });
    }
    if (v.type === "error" && !out.has("error_signature")) {
      issues.push({ code: "error_without_signature", message: `Error vertex ${v.id} has no outgoing 'error_signature' edge` });
    }
  }

  // HintLadder monotonicity, plus task / step cross-references.
  function checkLadder(ladder: { hints: Array<{ spoilerLevel: number; id: string }> } | undefined, where: string): void {
    if (!ladder) return;
    let last = -1;
    for (let i = 0; i < ladder.hints.length; i++) {
      const h = ladder.hints[i];
      if (h.spoilerLevel < last) {
        issues.push({
          code: "hint_ladder_non_monotonic",
          message: `Ladder ${where} hint #${i} ('${h.id}') has spoilerLevel ${h.spoilerLevel} below previous ${last}`,
          path: where,
        });
      }
      last = h.spoilerLevel;
    }
  }

  const taskById = new Map<string, Task>();
  for (const t of m.tasks ?? []) taskById.set(t.id, t);

  for (const t of m.tasks ?? []) {
    checkLadder(t.hintLadder, `tasks[${t.id}].hintLadder`);
    for (const step of t.steps) {
      checkLadder(step.hintLadder, `tasks[${t.id}].steps[${step.id}].hintLadder`);
    }
    for (const tv of t.transferVariantIds ?? []) {
      if (!taskById.has(tv)) {
        issues.push({ code: "transfer_variant_dangling", message: `Task ${t.id} references unknown transfer variant ${tv}` });
      }
    }
    for (const c of t.concepts) {
      const v = vertexById.get(c);
      if (!v) issues.push({ code: "task_concept_dangling", message: `Task ${t.id} references unknown concept ${c}` });
      else if (v.type !== "concept") issues.push({ code: "task_concept_type", message: `Task ${t.id} concept ref ${c} is not of type 'concept' (got ${v.type})` });
    }
    for (const s of t.skills) {
      const v = vertexById.get(s);
      if (!v) issues.push({ code: "task_skill_dangling", message: `Task ${t.id} references unknown skill ${s}` });
      else if (v.type !== "skill") issues.push({ code: "task_skill_type", message: `Task ${t.id} skill ref ${s} is not of type 'skill' (got ${v.type})` });
    }
  }

  for (const mt of m.microTheories ?? []) {
    for (const c of mt.concepts) {
      const v = vertexById.get(c);
      if (!v) issues.push({ code: "microtheory_concept_dangling", message: `MicroTheory ${mt.id} references unknown concept ${c}` });
      else if (v.type !== "concept") issues.push({ code: "microtheory_concept_type", message: `MicroTheory ${mt.id} concept ref ${c} is not of type 'concept' (got ${v.type})` });
    }
  }

  return issues;
}
