// Past-LTL invariant checker for an event-log trajectory.
//
// We support the three protocol-mandated invariants of chapter 05:
//   - phi_theory_first
//   - phi_no_proactive_spoiler  (parametric in jStar)
//   - phi_transfer_gate
//
// A trajectory is a chronologically sorted array of events. We project
// events into atomic predicates (chapter 03 §3.4) then evaluate the
// past-safety formulas by linear scan.

import type { Methodology } from "./types.js";

export interface InvariantViolation {
  invariantId: string;
  message: string;
  eventId: string;
  index: number;
}

export interface EventLogEntry {
  eventId: string;
  sessionId: string;
  studentId: string;
  methodologyId: string;
  methodologyVersion: string;
  controllerState: string;
  timestamp: string;
  kind: string;
  payload: Record<string, unknown>;
  reliability: number;
}

export function checkInvariants(
  log: EventLogEntry[],
  methodology: Methodology,
): InvariantViolation[] {
  const violations: InvariantViolation[] = [];

  // Build per-task concept set.
  const taskConcepts = new Map<string, Set<string>>();
  for (const t of methodology.tasks ?? []) {
    taskConcepts.set(t.id, new Set(t.concepts));
  }

  // jStar lookup: per-task; default 1.
  const taskJStar = new Map<string, number>();
  for (const t of methodology.tasks ?? []) {
    taskJStar.set(t.id, t.jStar ?? 1);
  }

  // Past-evidence registers reset per session.
  const sessionState = new Map<string, {
    theoryChecked: Set<string>;
    hintRequestedSinceLastDelivery: boolean;
    transferPassed: boolean;
  }>();
  function state(sid: string) {
    let s = sessionState.get(sid);
    if (!s) {
      s = { theoryChecked: new Set(), hintRequestedSinceLastDelivery: false, transferPassed: false };
      sessionState.set(sid, s);
    }
    return s;
  }

  for (let i = 0; i < log.length; i++) {
    const e = log[i];
    const s = state(e.sessionId);

    if (e.kind === "session_start") {
      sessionState.set(e.sessionId, {
        theoryChecked: new Set(),
        hintRequestedSinceLastDelivery: false,
        transferPassed: false,
      });
      continue;
    }

    if (e.kind === "theory_checked") {
      const c = String(e.payload?.conceptId ?? "");
      if (c) s.theoryChecked.add(c);
      continue;
    }

    if (e.kind === "hint_requested") {
      s.hintRequestedSinceLastDelivery = true;
      continue;
    }

    if (e.kind === "transfer_passed") {
      s.transferPassed = true;
      continue;
    }

    if (e.kind === "task_present") {
      const T = String(e.payload?.taskId ?? "");
      const concepts = taskConcepts.get(T);
      if (!concepts) {
        violations.push({
          invariantId: "phi_theory_first",
          message: `task_present references unknown taskId ${T}`,
          eventId: e.eventId,
          index: i,
        });
        continue;
      }
      for (const c of concepts) {
        if (!s.theoryChecked.has(c)) {
          violations.push({
            invariantId: "phi_theory_first",
            message: `task_present(${T}) without prior theory_checked(${c})`,
            eventId: e.eventId,
            index: i,
          });
        }
      }
      continue;
    }

    if (e.kind === "hint_delivered") {
      const j = Number(e.payload?.level ?? 0);
      const T = String(e.payload?.taskId ?? "");
      const jStar = taskJStar.get(T) ?? 1;
      if (j >= jStar && !s.hintRequestedSinceLastDelivery) {
        violations.push({
          invariantId: "phi_no_proactive_spoiler",
          message: `hint_delivered at level ${j} (>= jStar=${jStar}) without prior hint_requested`,
          eventId: e.eventId,
          index: i,
        });
      }
      // Reset the request gate after delivery.
      s.hintRequestedSinceLastDelivery = false;
      continue;
    }

    if (e.kind === "block_done") {
      if (!s.transferPassed) {
        violations.push({
          invariantId: "phi_transfer_gate",
          message: `block_done without prior transfer_passed`,
          eventId: e.eventId,
          index: i,
        });
      }
      // Reset for the next block within the same session.
      s.transferPassed = false;
      continue;
    }
  }

  return violations;
}
