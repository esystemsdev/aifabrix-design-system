import type { StateReason, StateReasonSource } from "../contracts/common";

export function stateReason(code: string, message: string, source: StateReasonSource): StateReason {
  if (!code.trim() || !message.trim()) {
    throw new Error("Control-state reasons require non-empty code and message");
  }
  return Object.freeze({ code, message, source });
}

export const pendingAccessReason = stateReason("access.pending", "Checking access…", "permission");
