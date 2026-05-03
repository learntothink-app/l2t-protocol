# 10 — Append-Only Invariant

L2T is designed for long-horizon educational research: events
recorded under one methodology version must remain interpretable
when the methodology evolves. To that end:

## 10.1 Methodology versioning

A methodology document carries a strictly monotonic
`methodologyVersion` (semantic version). The triple

```
(methodologyId, methodologyVersion, eventId)
```

forms the global identifier of any event. Two events with the same
`methodologyId` but different `methodologyVersion` MAY refer to
distinct vertex / edge sets — that is exactly what versioning
means.

## 10.2 Append-only training data

Logged event streams are append-only. Once recorded, an event is
**immutable**. Bug-fix corrections are themselves new events of
`kind: "correction"` whose payload references `correctedEventId`
and the field to be revised. Replay tools applying the
correction-projection MUST do so as a left-fold over the log; the
original log is never mutated in place.

This guarantee enables three operationally important properties:

- **Reproducibility.** A historical metric value can be recomputed
  exactly from a frozen log.
- **Auditability.** Pedagogical adjustments leave a paper trail.
- **Methodology comparison.** A retro-evaluation of methodology
  v1.0 vs v2.0 on the same cohort is a deterministic projection
  over the union log.

## 10.3 Schema evolution

Schema changes follow [semver](https://semver.org/):

- **Major** — incompatible change (renamed required field, removed
  vertex type, etc.). Old logs require an explicit migrator.
- **Minor** — backward-compatible additive change. Old logs
  validate against the new schema modulo default-value injection.
- **Patch** — clarification, typo fix, validator tightening with
  no semantic change.

The current `protocolVersion` is recorded at `Methodology.protocolVersion`
and again at the root of `manifest.schema.json`. Conformant
implementations MUST validate against the schema version named
in the methodology, not the latest one.

## 10.4 Storage neutrality

The protocol does not prescribe a transport. Conformant logs may
live in a relational table, a key-value store, an append-only file
log, an event-streaming system, or a content-addressed store. The
only constraint is that the canonical ordering by
`(sessionId, timestamp, eventId)` is recoverable.

## 10.5 Privacy and pseudonymisation

`studentId` is opaque to the protocol. Implementations are
responsible for pseudonymisation, retention, and right-to-erasure
flows. An erasure operation produces a new event of
`kind: "redaction"` whose payload identifies the erased fields by
JSONPath; the underlying event remains in the log with the marked
fields tombstoned.

This preserves the append-only invariant while honouring data-
protection obligations.
