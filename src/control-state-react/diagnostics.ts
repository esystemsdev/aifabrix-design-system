import type { StateReason } from "../control-state";

export function reportControlStateConflict(
  conflict: string | undefined,
  reason: StateReason | undefined,
  reasonId: string | undefined,
): void {
  if (conflict) console.error(conflict);
  if (reason && !reasonId) {
    console.error("Restricted controlState requires stateReasonId");
  }
}
