# Contributing to L2T Protocol

The L2T Protocol is an open standard for executable pedagogy. We
welcome contributions in four categories:

1. **Schema extensions** — additional vertex/edge types in the
   knowledge hypergraph, additional event fields, additional
   invariants.
2. **Validator improvements** — better error messages, coverage of
   more invariant patterns.
3. **Example methodologies** — L2T-conformant methodologies in new
   domains. See `examples/01-minimal/` for the format.
4. **Specification clarifications** — improvements to `spec/` prose.

## Process

1. Open an issue describing the proposed change.
2. Fork the repository; create a feature branch.
3. For schema changes: bump version in
   `schemas/manifest.schema.json` per semver (breaking → major,
   additive → minor, clarification → patch).
4. Update `CHANGELOG.md`.
5. Open a pull request.

## Conformance

A methodology is L2T-conformant iff:

1. Every object validates against its corresponding schema in
   `schemas/`.
2. All cross-references resolve.
3. The hypergraph satisfies the structural constraints of
   `spec/01-knowledge-hypergraph.md`.
4. Any logged trajectory respects the past-LTL invariants of
   `spec/05-pedagogical-invariants.md`.

Run `validator/` before submitting.

## License

By contributing, you agree that your contributions will be licensed
under the Apache License 2.0.
