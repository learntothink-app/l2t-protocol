# L2T Reference Validator

A TypeScript implementation of the three conformance layers defined
in the L2T protocol:

1. **Schema validation.** Every object validates against its JSON
   Schema in `../schemas/`.
2. **Structural integrity.** Cross-references resolve, vertex types
   are compatible with edge kinds, prerequisite DAG is acyclic,
   hint ladders are non-decreasing.
3. **Past-LTL invariant evaluation.** A trajectory is checked
   against the three protocol-mandated invariants
   (`phi_theory_first`, `phi_no_proactive_spoiler`,
   `phi_transfer_gate`).

## Build

```sh
npm install
npm run build
```

## CLI

```sh
node dist/cli.js methodology path/to/methodology.json
node dist/cli.js events path/to/methodology.json path/to/events.json
```

Exit codes:

- `0` — conformance passes
- `1` — at least one schema, structural or invariant violation
- `2` — invocation error

## Programmatic API

```ts
import { validateMethodology, validateEventLog } from "@l2t-protocol/validator";

const result = validateMethodology(JSON.parse(fs.readFileSync("methodology.json", "utf8")));
if (!result.ok) {
  console.error(result.schemaErrors, result.structuralIssues);
}
```

## Status

Reference, not exhaustive. The current implementation covers the
minimum viable conformance surface; extensions for custom invariants,
classifier-based reliability, and live-stream event validation are
planned.
