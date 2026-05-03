# 02 — Pedagogical Primitives

Three first-class primitives compose the bulk of an L2T methodology:
`Task`, `MicroTheory` and `Probe`. Their abstract types follow the
paper (Sec. IV.A.b).

## 2.1 Task

```
Task = ⟨id,
        concepts        ⊆ V_concept,
        skills          ⊆ V_skill,
        steps           : SearchStep*,
        hint_ladder     : HintLadder,
        transfer_variants : Task*,
        retention_schedule? : RetentionSchedule⟩
```

A task references the concepts and skills it addresses, decomposes
into an ordered list of `SearchStep`s, and exposes a single
`HintLadder` (top-level) plus optional per-step ladders.

`transfer_variants` are structurally altered tasks that test the same
skill set without admitting copy-paste. They are themselves Tasks; the
parent task references them by `id`.

`retention_schedule`, if present, prescribes follow-up reassessments
at delays `Δt` (default 1, 3, 7, 14 days, paper Eq. 32).

## 2.2 MicroTheory

```
MicroTheory = ⟨id,
                content_tex,
                concepts       ⊆ V_concept,
                check_question : Probe,
                eval_policy    : EvaluationPolicy⟩
```

A MicroTheory is the smallest unit of declarative content. It carries
markdown/LaTeX prose (`content_tex`), references the concepts it
introduces, and embeds a `check_question` (a Probe) used by the
controller's `THEORY_CHECK` state.

The `eval_policy` field controls how the check answer is scored:

- `AUTO_COMPUTE` — deterministic scoring against `result_spec`;
- `SELF_CHECK_COMPUTE` — student compares own work against an oracle;
- `SELF_CHECK_PROOF` — student supplies a justification, scored by
  rubric.

## 2.3 Probe

```
Probe = ⟨id,
          target_skills   ⊆ V_skill,
          target_errors?  ⊆ V_error,
          answer_spec     : AnswerSpec,
          info_gain_prior : ℝ_{≥0}⟩
```

Probes are diagnostic questions chosen by maximising expected
information gain about the latent state (paper Eq. 8):

    q* = argmax_{q ∈ Q} 𝔼[ IG(S; O | q, x_t) ]

The `info_gain_prior` is a non-negative scalar that seeds the greedy
selection algorithm before observed evidence accumulates. The
`answer_spec` covers the same shapes as `SearchStep.result_spec`.

## 2.4 SearchStep

```
SearchStep = ⟨id,
               target_label,
               result_spec,
               evaluation_policy ∈ { AUTO_COMPUTE,
                                     SELF_CHECK_COMPUTE,
                                     SELF_CHECK_PROOF },
               thinking_tool_ids : ThinkingTool[]?,
               solution_tex?⟩
```

`SearchStep` is a single hypothesis or computational sub-goal. It is
the *tutor's internal* solution model — not text shown verbatim to
the student. The `target_label` names the variable or quantity being
solved for; `result_spec` constrains acceptable answers; the
`evaluation_policy` selects the scoring regime; `thinking_tool_ids`
pin which named tools (theorems, methods, techniques) are expected to
be invoked.

`solution_tex` is an optional canonical written form for the step,
used when the student requests a full reveal.

## 2.5 HintLadder

```
HintLadder = ⟨H_i = [h_{i,1}, …, h_{i,n_i}]⟩

with spoiler_level(h_{i,j}) non-decreasing in j                (Eq. 24)
```

Each hint has an integer `spoiler_level` from 0 (framing question)
up to the step's full solution. Mid-ladder hints typically sit at
levels 1 (directed question), 2 (search direction), 3 (technique
hint), 4 (partial solution), 5 (full solution).

The non-decreasing property is a structural invariant: a hint at
position `j+1` MUST have `spoiler_level ≥ spoiler_level(h_j)`.

The controller's `GIVE_HINT` transition (paper Sec. V.B) is permitted
**only** in response to an explicit `hint_requested` event; this is
verified by `φ_no_proactive_spoiler` (see chapter 05).

## 2.6 ThinkingTool and ThinkingSystem

```
ThinkingTool   = ⟨id, name, kind, content_tex⟩
ThinkingSystem = ⟨version, tool_ids ⊆ ThinkingTool⟩
```

Tools are reusable named devices: a theorem, an algorithmic method,
a heuristic. Systems are versioned snapshots of the *student's* tool
repertoire. An *increment* event (in the event log) encodes the
transition `system_v → system_{v+1}` and references the new tools
introduced.

ThinkingSystem progression is orthogonal to skill mastery — a student
may have mastered all related skills yet still lack the
generalisation a particular tool provides.
