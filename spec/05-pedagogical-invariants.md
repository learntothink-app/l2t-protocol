# 05 — Pedagogical Invariants

Pedagogical invariants are formulas of past-time Linear Temporal
Logic (past-LTL) over the event stream's atomic predicates. The
protocol fixes three mandatory invariants; methodologies may add
further invariants of their own.

A trajectory `τ` produced by a policy `π` *guarantees* an invariant
`φ` iff `σ(τ) ⊨ φ` (paper, Definition 1).

The modality `◇⁻¹ p` reads "at some point in the past, `p` held".

## 5.1 Theory-first

```
φ_theory_first =
   □ ( task_present(T) →
        ⋀_{c ∈ Concepts(T)} ◇⁻¹ theory_checked(c) )         (C1.a)
```

A task may be presented only after every concept it involves has
been checked at least once in the session prefix.

## 5.2 No proactive spoiler

```
φ_no_spoiler =
   □ ( hint_delivered_j ∧ (j ≥ j*) → ◇⁻¹ hint_requested )    (C1.b)
```

A hint at spoiler level `j ≥ j*` is permitted only after an explicit
`hint_requested` event. The threshold `j*` is methodology-specified;
the conservative default is `j* = 1` so even directed-question hints
require explicit student request.

## 5.3 Transfer gate

```
φ_transfer_gate =
   □ ( block_done → ◇⁻¹ transfer_passed )                    (C1.c)
```

A pedagogical block is closed only after at least one transfer
variant has been solved. Mastery on the source task alone is not
sufficient evidence of learning.

## 5.4 Compositionality

The three formulas above are past-safety formulas of the form
`□(p → ◇⁻¹ q)`. By Theorem 5 of the paper, past-safety formulas are
closed under sequential composition: if blocks `B_1` and `B_2`
each guarantee `φ` and the join transition introduces no
violating predicates, the composite `B_1 · B_2` also guarantees `φ`.

This makes per-block verification sufficient and makes the protocol
modular: methodology authors can ship blocks that compose without
redoing the global proof.

## 5.5 Custom invariants

Authors may add invariants under `methodology.customInvariants[]`:

```jsonc
{
  "id": "phi_pre_drill_practice",
  "label": "All drills attempted before final transfer task",
  "formula": "□ ( task_present(T_final) → ⋀_{d ∈ Drills(T_final)} ◇⁻¹ drill_attempted(d) )",
  "atomicPredicates": ["task_present", "drill_attempted"]
}
```

Custom invariants must be past-safety to retain compositional
verifiability. The validator checks the formula structure
syntactically; semantic admissibility is the author's responsibility.

## 5.6 Verification budget

For a methodology composed of `N` blocks, modular verification costs
`O(N · max_i(|Q_i| · |φ|))` per-block plus `O(N)` admissibility
checks. Monolithic verification without decomposition is `O(∏_i |Q_i|)`
in the worst case (paper, Corollary 2). Authors are therefore
strongly encouraged to keep blocks small.
