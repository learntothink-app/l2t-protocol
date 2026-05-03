#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { validateMethodology, validateEventLog } from "./index.js";
import type { Methodology } from "./types.js";

function usage(): never {
  console.error(`Usage:
  l2t-validate methodology <path/to/methodology.json>
  l2t-validate events <path/to/methodology.json> <path/to/events.json>`);
  process.exit(2);
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function main(): void {
  const [, , cmd, a, b] = process.argv;
  if (!cmd) usage();
  if (cmd === "methodology") {
    if (!a) usage();
    const result = validateMethodology(readJson(a));
    if (result.ok) {
      console.log("OK: methodology conforms.");
      process.exit(0);
    }
    if (result.schemaErrors) console.error("Schema errors:\n" + result.schemaErrors);
    for (const i of result.structuralIssues) console.error(`[${i.code}] ${i.message}` + (i.path ? ` (at ${i.path})` : ""));
    process.exit(1);
  }
  if (cmd === "events") {
    if (!a || !b) usage();
    const m = readJson(a) as Methodology;
    const log = readJson(b) as unknown[];
    const result = validateEventLog(log, m);
    if (result.ok) {
      console.log(`OK: ${log.length} events, no violations.`);
      process.exit(0);
    }
    if (result.schemaErrors) console.error("Event schema errors:\n" + result.schemaErrors);
    for (const v of result.invariantViolations) {
      console.error(`[${v.invariantId}] ${v.message} (event ${v.eventId}, index ${v.index})`);
    }
    process.exit(1);
  }
  usage();
}

main();
