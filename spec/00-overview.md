# 00 — Overview

The L2T protocol formalises a tutoring session as a four-layer stack:

```
┌─────────────────────────────────────────────────────────────┐
│  Language layer (LLM)                                       │
│  Free-form Russian / English / … natural-language synthesis │
│  bounded by the controller's frame (no policy decisions).   │
├─────────────────────────────────────────────────────────────┤
│  Controller (deterministic FSM)                             │
│  Kripke structure over pedagogical states.                  │
│  Enforces past-LTL invariants by construction.              │
├─────────────────────────────────────────────────────────────┤
│  Inference layer (POMDP)                                    │
│  Belief over latent student state s_t = (p, c, m, e, ψ).    │
│  Reliability-weighted Bayesian update.                      │
├─────────────────────────────────────────────────────────────┤
│  Knowledge layer (typed hypergraph H = (V, E))              │
│  Pedagogical primitives: tasks, micro-theories, probes,     │
│  hint ladders, transfer variants, retention schedules.      │
└─────────────────────────────────────────────────────────────┘
```

The L2T protocol — this repository — specifies the bottom two layers
(knowledge + inference) as **machine-readable JSON**, plus the
event-log schema that the controller emits. The controller and language
layers are referenced by their interface contracts; their
implementations belong to the runtime.

## Glossary

- **Methodology** — top-level container; the unit of authoring.
- **Knowledge hypergraph** — directed, typed multi-hypergraph over
  eight vertex types with six base edge types.
- **Concept / Skill / Meta-skill** — vertices of the corresponding type.
- **Task / Drill / Probe** — pedagogical action vertices; tasks are
  full problems, drills are short reinforcement, probes are
  diagnostic questions.
- **MicroTheory** — atomic theory block; a `Concept` may be linked to
  one or more MicroTheories.
- **SearchStep** — one step in a task's solution decomposition; each
  step has a `target_label`, `result_spec`, `evaluation_policy` and
  optional `thinking_tool_ids`.
- **HintLadder** — ordered list of hints attached to a task or step
  with monotonically non-decreasing spoiler level.
- **Mastery probability** `p_t,k` — current belief that the student has
  mastered skill `k`.
- **Reliability score** `q_t ∈ [0,1]` — trustworthiness of observation
  at time `t`.
- **Past-LTL invariant** — formula over the trajectory's *prefix* that
  every conformant log must satisfy.

## Document map

| Chapter | Subject |
|---------|---------|
| 01 | Knowledge hypergraph: vertices, hyperedges, prerequisite DAG |
| 02 | Pedagogical primitives: Task, MicroTheory, Probe, SearchStep |
| 03 | Event log schema |
| 04 | Controller finite-state machine |
| 05 | Pedagogical invariants (past-LTL formulas) |
| 06 | POMDP formulation and belief update |
| 07 | Reliability score `q_t` and contamination model |
| 08 | Operational definitions of metrics |
| 09 | Hint ladder semantics and spoiler levels |
| 10 | Append-only invariant and methodology versioning |

## Reference paper

Yusupova, T., Popov, A., Smorchkov, D., Chuprov, A. *LearnToThink:
Structuring Adaptive Tutoring via Typed Hypergraphs and Verifiable
Pedagogy* (2026). All chapter cross-references of the form `(Eq. N)`
or `(Sec. N)` point to that paper.
