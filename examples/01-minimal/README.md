# Example 01 — Minimal demo

The smallest fully conformant L2T methodology. It exercises:

- one `topic`, two `concept`s, one `skill`, one `error`, one `probe`,
  one `task`, one `drill`;
- one `MicroTheory` whose `checkQuestion` references the probe;
- one `Task` with a single `SearchStep`;
- a three-rung hint ladder with monotonically increasing spoiler
  level (0 → 1 → 3);
- a heuristic reliability function with default coefficients.

Validate with the reference validator:

```sh
cd ../../validator
npm install
npm run build
node dist/cli.js methodology ../examples/01-minimal/methodology.json
```

Expected output: `OK: methodology conforms.`
