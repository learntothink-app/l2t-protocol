import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { loadAllSchemas } from "./load-schemas.js";
import { checkStructural, type StructuralIssue } from "./structural.js";
import { checkInvariants, type EventLogEntry, type InvariantViolation } from "./invariants.js";
import type { Methodology } from "./types.js";

export type { Methodology, StructuralIssue, InvariantViolation, EventLogEntry };

export interface ValidationResult {
  ok: boolean;
  schemaErrors: ReturnType<Ajv2020["errorsText"]> | string;
  structuralIssues: StructuralIssue[];
  invariantViolations: InvariantViolation[];
}

let cachedAjv: Ajv2020 | null = null;
function getAjv(): Ajv2020 {
  if (cachedAjv) return cachedAjv;
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const schemas = loadAllSchemas();
  for (const [name, schema] of Object.entries(schemas)) {
    ajv.addSchema(schema as object, `https://learntothink-app.github.io/l2t-protocol/schemas/${name}`);
  }
  cachedAjv = ajv;
  return ajv;
}

export function validateMethodology(doc: unknown): ValidationResult {
  const ajv = getAjv();
  const validate = ajv.getSchema(
    "https://learntothink-app.github.io/l2t-protocol/schemas/methodology.schema.json",
  );
  if (!validate) {
    return {
      ok: false,
      schemaErrors: "methodology schema not found",
      structuralIssues: [],
      invariantViolations: [],
    };
  }
  const passed = validate(doc) as boolean;
  if (!passed) {
    return {
      ok: false,
      schemaErrors: ajv.errorsText(validate.errors, { separator: "\n" }),
      structuralIssues: [],
      invariantViolations: [],
    };
  }
  const structuralIssues = checkStructural(doc as Methodology);
  return {
    ok: structuralIssues.length === 0,
    schemaErrors: "",
    structuralIssues,
    invariantViolations: [],
  };
}

export function validateEventLog(log: unknown[], methodology: Methodology): ValidationResult {
  const ajv = getAjv();
  const validate = ajv.getSchema(
    "https://learntothink-app.github.io/l2t-protocol/schemas/event-log.schema.json",
  );
  if (!validate) {
    return {
      ok: false,
      schemaErrors: "event-log schema not found",
      structuralIssues: [],
      invariantViolations: [],
    };
  }
  let schemaErrors = "";
  for (let i = 0; i < log.length; i++) {
    if (!validate(log[i])) {
      schemaErrors += `event[${i}]: ${ajv.errorsText(validate.errors, { separator: "; " })}\n`;
    }
  }
  if (schemaErrors) {
    return { ok: false, schemaErrors, structuralIssues: [], invariantViolations: [] };
  }
  const violations = checkInvariants(log as EventLogEntry[], methodology);
  return {
    ok: violations.length === 0,
    schemaErrors: "",
    structuralIssues: [],
    invariantViolations: violations,
  };
}
