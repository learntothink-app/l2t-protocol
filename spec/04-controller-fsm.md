# 04 — Controller Finite-State Machine

The controller is implemented as a Kripke structure (paper Sec. V.B)

    M_c = (Q, q_0, δ, L)

with `Q` a finite set of pedagogical states, `q_0 ∈ Q` the initial
state, `δ ⊆ Q × Ev × Q` the labelled transition relation, and
`L : Q → 2^AP` the labelling function over atomic predicates.

The protocol fixes the canonical state set so that conformance checks
written against atomic predicates (chapter 03) carry over across
implementations.

## 4.1 Canonical states

```
GREETING
THEORY_PRESENT
THEORY_CHECK
TASK_PRESENT
WAIT_INTENT
INTENT_CLARIFY
STEP_MATCH
ASK_RESULT
EVAL_RESULT
GIVE_HINT
CHECK_TASK_GATE
TASK_DONE
TRANSFER
RETENTION
SUMMARY
BLOCK_DONE
```

Forward transitions follow this order. The controller is allowed
backward and cyclic transitions for the cases enumerated below
(paper Sec. V.B):

- On a failed `THEORY_CHECK`, return to `THEORY_PRESENT` with a
  simpler presentation; up to three attempts before a diagnostic
  probe is interjected.
- On a failed `RETENTION`, conditional return to `THEORY_PRESENT`
  for the related concept.
- `EVAL_RESULT` may return to `STEP_MATCH` for rework of a partially
  correct answer.

## 4.2 Atomic predicates

The labelling `L` exposes (paper Sec. V.B):

```
AP = { theory_checked(c)   for c ∈ V_concept,
       task_present(T)     for T ∈ V_task,
       hint_requested,
       hint_delivered_j    for j ∈ ℕ,
       transfer_passed,
       block_done,
       step_completed,
       … }
```

The full list is enumerable from the methodology by binding `c` to
each `concept.id` and `T` to each `task.id`.

## 4.3 GIVE_HINT discipline

Transition into `GIVE_HINT` is **only** triggered by an explicit
`hint_requested` event from the student. Without this event the
controller remains in `STEP_MATCH` or `ASK_RESULT`. This realises
the past-LTL invariant `Inv_no_proactive_spoiler` (chapter 05).

## 4.4 Two-step verify-then-respond

`EVAL_RESULT` may transition back to `STEP_MATCH` instead of forward
to `CHECK_TASK_GATE`. This implements the stepwise verification
pattern: the controller first locates the specific deficit, then
generates targeted feedback, rather than a single forward pass that
risks generic responses.

## 4.5 LLM scope

The language layer is invoked **only** during

- `THEORY_PRESENT`: rephrase, simplify, or translate a MicroTheory
- `ASK_RESULT`: pose the controller-selected question naturally
- `EVAL_RESULT`: produce free-form feedback within the
  controller-fixed frame
- `GIVE_HINT`: deliver the chosen ladder rung in natural prose
- `INTENT_CLARIFY`: assist the student in formulating a hypothesis
  *without* revealing hints absent an explicit `hint_requested`

In every other state the controller acts deterministically without
language-layer involvement.
