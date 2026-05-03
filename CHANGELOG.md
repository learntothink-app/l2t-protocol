# Changelog

All notable changes to the L2T protocol are documented here. The
protocol uses [semantic versioning](https://semver.org/).

## [0.1.0] — 2026-05-03

Initial public release. Protocol skeleton, schemas for the
foundational primitives, reference validator and a minimal
end-to-end example.

### Added

- Specification chapters 00–10 covering knowledge hypergraph,
  pedagogical primitives, event log, controller FSM, past-LTL
  invariants, POMDP formulation, reliability score, metrics, hint
  ladder semantics and the append-only invariant.
- JSON Schemas for `Methodology`, `KnowledgeHypergraph`, `Vertex`,
  `Hyperedge`, `Task`, `MicroTheory`, `Probe`, `SearchStep`,
  `HintLadder` and the event-log entry.
- TypeScript reference validator with three layers of checks:
  schema validation, structural integrity, past-LTL invariant
  evaluation against an event log.
- Example `01-minimal` exercising every primitive type.
