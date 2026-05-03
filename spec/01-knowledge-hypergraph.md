# 01 — Knowledge Hypergraph

The knowledge layer is a typed directed hypergraph

    H = (V, E)

with `V` partitioned by vertex type and `E` partitioned by hyperedge
type (paper, Eq. 1).

## 1.1 Vertex types

```
V = V_concept ∪ V_skill ∪ V_metaskill ∪ V_error
        ∪ V_task ∪ V_drill ∪ V_probe ∪ V_topic
```

| Type        | Meaning                                              |
|-------------|------------------------------------------------------|
| `concept`   | Declarative knowledge unit (a definition, a theorem) |
| `skill`     | Procedural competency the student exercises          |
| `metaskill` | Latent accelerator (e.g. self-explanation, planning) |
| `error`     | Characteristic mistake pattern                       |
| `task`      | Full pedagogical task (a problem)                    |
| `drill`     | Short reinforcement exercise                         |
| `probe`     | Diagnostic question used for Bayesian inference      |
| `topic`     | Curricular grouping; coarsest-grained vertex         |

Every vertex has a stable string `id`, a `type`, a human-readable
`label`, and an optional `description`.

## 1.2 Hyperedge types

A hyperedge

    e = (tail(e), head(e), kind(e))                              (Eq. 2)

with `tail(e), head(e) ⊆ V` finite, and `kind(e)` from the set:

| `kind`              | Tail              | Head                  | Default weight |
|---------------------|-------------------|-----------------------|----------------|
| `requires`          | `skill`           | `skill`               | 1.0            |
| `trains`            | `task`/`drill`    | `skill` / `metaskill` | 1.0            |
| `diagnoses`         | `probe`           | `skill` / `error`     | 1.5            |
| `error_signature`   | `error`           | `skill`               | 1.8            |
| `meta_helps_learn`  | `metaskill`       | `skill`               | 1.0            |
| `transfer_variant`  | `task`            | `task`                | 1.0            |

Authoring environments may add custom edge kinds, but the six above
are the **base set**; default propagation operator weights `w_κ`
(paper, Eq. 5) are tuned for them.

## 1.3 Prerequisite DAG

Structural prerequisites live in a separate directed acyclic graph
on skills

    G_pr = (V_skill, →_pr)
    S_i →_pr S_j ⇔ S_i is a prerequisite for S_j               (Eq. 3)

Isolating `G_pr` from `H` permits independent topological-consistency
validation. Conformant methodologies MUST guarantee `G_pr` is acyclic.

## 1.4 Propagation operator (informative)

Mastery updates flow through the hypergraph via

    G(H) = D_v^(-1/2) · ( Σ_κ w_κ H_κ W_κ ) · D_e^(-1/2)         (Eq. 5)

where `H_κ` is the incidence matrix for edge type `κ`, `W_κ` is the
diagonal of per-edge weights, and `D_v`, `D_e` are vertex / edge
degree matrices. The protocol does not prescribe an inference engine;
it standardises the *graph structure* such inference engines consume.

## 1.5 Conformance constraints

A conformant `KnowledgeHypergraph` document MUST satisfy:

1. Every `vertex.id` is unique within the methodology.
2. Every `edge.tail[i]` and `edge.head[i]` resolves to a defined vertex.
3. Tail/head vertex types respect the table in §1.2 for the base edge
   kinds.
4. The `requires` edges form an acyclic DAG over `V_skill`.
5. Every `task` vertex has at least one outgoing `trains` edge.
6. Every `probe` vertex has at least one outgoing `diagnoses` edge and
   carries a non-empty `info_gain_prior` (see §2.3).
7. Every `error` vertex has at least one outgoing `error_signature`
   edge.

The reference validator in `validator/` enforces all seven.
