# 09 — Hint Ladder

A hint ladder is an ordered sequence of hints attached to a
`SearchStep` or to a top-level `Task`. The protocol fixes the
ladder semantics so that the past-LTL invariant
`φ_no_proactive_spoiler` (chapter 05) and the metric `m_hint`
(chapter 08) are both implementation-agnostic.

## 9.1 Spoiler levels

Every hint carries an integer `spoilerLevel ∈ {0, 1, 2, 3, 4, 5}`:

| Level | Intent                                                       |
|-------|--------------------------------------------------------------|
| 0     | Framing question — re-orients the student without telling    |
| 1     | Directed question — asks about the relevant sub-quantity     |
| 2     | Search-direction hint — points to the area to look in        |
| 3     | Technique hint — names the method to apply                   |
| 4     | Partial solution — fills in the first non-trivial step       |
| 5     | Full solution — reveals the answer                           |

Authors are free to use a subset; consecutive omitted levels do
not break monotonicity.

## 9.2 Monotonic non-decreasing constraint

For a ladder `H_i = [h_{i,1}, …, h_{i,n_i}]`,

```
spoilerLevel(h_{i,j+1}) ≥ spoilerLevel(h_{i,j})              (Eq. 24)
```

The schema validator enforces this property mechanically.

## 9.3 Threshold `j*`

Each step (or task) carries a `j_star` field that names the lowest
spoiler level the controller may *not* deliver without an explicit
`hint_requested` event. The default is `j_star = 1` so even
directed-question hints require explicit student request; authors
may relax to `j_star = 2` (release framing + directed questions
proactively) or tighten to `j_star = 0` (no proactive
language-layer hint synthesis at all).

`φ_no_proactive_spoiler` is parametric in `j_star`:

```
□ ( hint_delivered_j ∧ (j ≥ j_star) → ◇⁻¹ hint_requested )
```

## 9.4 Ladder isolation

To preserve the submodularity of probe selection (paper Theorem 1),
ladder hints across different probes MUST be operationally
independent: a hint delivered for probe `q_a` MUST NOT reveal
information about probe `q_b`'s answer. This is sometimes referred
to in the paper as "isolation of hint ladders across probes".

The protocol does not enforce this constraint syntactically; it
falls to authoring review. Validators MAY emit a warning when a
hint at level `≥ 4` references a vertex that another step's ladder
also references.

## 9.5 Composition with theory checks

If a step's hint ladder reaches `spoilerLevel = 5` without success,
the controller MUST transition to `THEORY_PRESENT` for the most
relevant concept (selected by the propagation operator, paper
Eq. 5) before re-attempting the step. This prevents endless
spoiler escalation on a missing prerequisite.

## 9.6 Localisation

`hint.text` is the natural-language string presented to the
student. The protocol does not constrain the language; runtimes
that translate at delivery MUST preserve `spoilerLevel`.
