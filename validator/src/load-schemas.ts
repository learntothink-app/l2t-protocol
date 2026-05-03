import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Locate the `schemas/` directory relative to either the source tree
 * (when running via tsx) or the compiled `dist/` tree. We walk upward
 * from the validator package looking for a sibling `schemas/`.
 */
function findSchemaDir(): string {
  let cur = __dirname;
  for (let i = 0; i < 5; i++) {
    const candidate = join(cur, "..", "schemas");
    try {
      readdirSync(candidate);
      return candidate;
    } catch {
      cur = join(cur, "..");
    }
  }
  throw new Error("Could not locate schemas/ directory");
}

export function loadAllSchemas(): Record<string, unknown> {
  const dir = findSchemaDir();
  const out: Record<string, unknown> = {};
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".schema.json")) continue;
    const raw = readFileSync(join(dir, name), "utf8");
    out[name] = JSON.parse(raw);
  }
  return out;
}
