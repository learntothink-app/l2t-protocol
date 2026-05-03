# L2T — LearnToThink Protocol

An open standard for executable pedagogy: a machine-readable, versioned,
inspectable specification of *how* to teach.

The L2T protocol is the data format described in *LearnToThink: a hybrid
deterministic-controller + POMDP framework for adaptive tutoring*. It
formalises four things at once:

1. **What to teach** — typed knowledge hypergraph over concepts, skills,
   meta-skills, error patterns, tasks, drills, probes and topics.
2. **How to teach** — solution-step decompositions, monotonic hint
   ladders, micro-theory blocks, transfer variants, retention schedules.
3. **How to measure** — operational definitions of mastery, transfer,
   retention, reliability, calibration, hint-discipline, robustness.
4. **How to log** — append-only event schema spanning the full
   controller finite-state machine, with reliability scores attached.

L2T is intended as the missing interoperability layer between intelligent
tutoring systems, pedagogical knowledge graphs, and LLM-mediated
language layers. It is deliberately separate from any specific UI or
runtime; an L2T-conformant specification can be replayed by any
controller that respects the past-LTL pedagogical invariants of
[`spec/05-pedagogical-invariants.md`](spec/05-pedagogical-invariants.md).

## Repository layout

```
spec/         Prose specification, one chapter per concept
schemas/      JSON Schema (draft 2020-12) for every object type
examples/     End-to-end conformant methodologies
validator/    TypeScript implementation of schema + invariant checks
docs/         Diagrams and supporting material
```

Start with [`spec/00-overview.md`](spec/00-overview.md) for the big
picture, then read the individual chapters in numerical order.

## Versioning

The protocol uses [semantic versioning](https://semver.org/). Breaking
changes to schemas bump the major number; additive fields bump minor;
clarifications and bug fixes bump patch. The current version is recorded
in [`schemas/manifest.schema.json`](schemas/manifest.schema.json) under
the `protocolVersion` field and is embedded in every conformant
methodology document.

## Append-only invariant

Methodologies are append-only. When an authoring change is made, a new
`methodologyVersion` is minted; previous versions remain readable so
that historical event logs continue to make sense. See
[`spec/10-append-only.md`](spec/10-append-only.md).

## Conformance

A methodology is L2T-conformant iff:

1. Every object validates against its corresponding schema in `schemas/`.
2. All cross-references resolve (e.g. every `taskId` referenced by an
   event log entry is defined in the methodology).
3. The hypergraph satisfies the structural constraints of
   [`spec/01-knowledge-hypergraph.md`](spec/01-knowledge-hypergraph.md)
   (typed vertices, acyclic prerequisite DAG, etc.).
4. Any logged trajectory respects the past-LTL invariants of
   [`spec/05-pedagogical-invariants.md`](spec/05-pedagogical-invariants.md).

The reference validator in `validator/` checks all four levels.

## License

Apache License 2.0 — see [`LICENSE`](LICENSE).
