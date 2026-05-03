# 03 — Event Log

A conformant runtime emits an **append-only** sequence of events that
capture every controller transition and every student observation.
Events feed three downstream consumers:

1. The POMDP belief update (paper Eq. 4).
2. The reliability score `q_t` estimator (paper Eq. 23).
3. The metric layer of chapter 08.

## 3.1 Common envelope

Every event carries:

```jsonc
{
  "eventId": "uuid",
  "sessionId": "uuid",
  "studentId": "string",
  "methodologyId": "string",
  "methodologyVersion": "1.0.0",
  "controllerState": "STEP_MATCH",
  "timestamp": "2026-05-03T14:00:00Z",
  "kind": "task_present",
  "payload": { /* event-specific */ },
  "reliability": 0.87
}
```

`reliability` is the `q_t` value computed for this event (chapter 07).
For events that are *outputs* of the controller (not student inputs),
`reliability` MUST be `1.0`.

## 3.2 Event taxonomy

### Controller-emitted

| `kind`                   | Trigger                                                     |
|--------------------------|-------------------------------------------------------------|
| `session_start`          | First event of a session                                    |
| `theory_present`         | Controller surfaces a MicroTheory                           |
| `theory_checked`         | Student passed the embedded check question                  |
| `task_present`           | Controller surfaces a Task                                  |
| `step_match`             | Controller routed student input to a specific SearchStep    |
| `eval_result`            | Outcome of evaluating a step or task                        |
| `hint_delivered`         | Controller answered a `hint_requested` with a ladder rung   |
| `task_done`              | Task closed (passed or abandoned)                           |
| `transfer_passed`        | A transfer-variant task was solved                          |
| `block_done`             | A pedagogical block closed                                  |
| `retention_due`          | Controller scheduled a retention reassessment               |
| `summary`                | Session summary generated                                   |
| `session_end`            | Last event of a session                                     |

### Student-emitted

| `kind`                   | Trigger                                                     |
|--------------------------|-------------------------------------------------------------|
| `answer_submitted`       | Free-form / structured answer to a probe / step / task      |
| `hint_requested`         | Explicit hint request                                       |
| `intent_clarified`       | Disambiguation of a previously vague intent                 |
| `pause`                  | Idle / context-switch                                       |
| `give_up`                | Explicit abandonment                                        |

### Inference-emitted

| `kind`                   | Trigger                                                     |
|--------------------------|-------------------------------------------------------------|
| `belief_update`          | After Bayes update; payload carries the change to `b_t`     |
| `policy_decision`        | Action selection by the policy (`π_θ`, bandit, or rules)    |
| `reliability_revised`    | `q_t` recomputed after evidence accrual                     |

## 3.3 Append-only invariant

Once recorded, an event is **immutable**. Corrections are themselves
new events of `kind: "correction"` whose `payload` carries the
`correctedEventId` and the field to be revised. Replay tools MUST
honour the correction-applied projection, but the underlying log is
never mutated. This makes long-term metric reproducibility possible
(see chapter 10).

## 3.4 Past-LTL signature

The LTL invariants of chapter 05 are evaluated against the *atomic
predicates* derivable from the event stream. The mapping is:

| Atomic predicate           | Derived from event of kind                  |
|----------------------------|---------------------------------------------|
| `task_present(T)`          | `task_present` with `payload.taskId == T`   |
| `theory_checked(c)`        | `theory_checked` with `payload.conceptId`   |
| `hint_requested`           | `hint_requested`                            |
| `hint_delivered_j`         | `hint_delivered` with `payload.level == j`  |
| `transfer_passed`          | `transfer_passed`                           |
| `block_done`               | `block_done`                                |
| `step_completed`           | `eval_result.passed == true`                |

Conformance checks consume the event log and the predicate mapping
to test each invariant in chapter 05.
