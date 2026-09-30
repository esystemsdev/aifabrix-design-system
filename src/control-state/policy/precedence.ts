import type { ActionState } from "../contracts/action-state";
import type { AccessResolution, StateReason } from "../contracts/common";
import { pendingAccessReason } from "./reasons";

export type ActionResolutionInput = Readonly<{
  visible?: boolean;
  access: AccessResolution;
  deniedReason: StateReason;
  available?: boolean;
  unavailableReason?: StateReason;
  busy?: boolean;
  busyLabel?: string;
}>;

export function resolveActionState(input: ActionResolutionInput): ActionState {
  if (input.visible === false) {
    return { family: "action", visibility: "hidden" };
  }
  if (input.access === "pending") {
    return disabledAction(pendingAccessReason);
  }
  if (input.access === "denied") {
    return disabledAction(input.deniedReason);
  }
  if (input.available === false) {
    if (!input.unavailableReason) {
      throw new Error("Unavailable actions require a reason");
    }
    return disabledAction(input.unavailableReason);
  }
  if (input.busy) {
    return {
      family: "action",
      visibility: "visible",
      interaction: "enabled",
      activity: "busy",
      busyLabel: input.busyLabel ?? "Working…",
    };
  }
  return {
    family: "action",
    visibility: "visible",
    interaction: "enabled",
    activity: "idle",
  };
}

function disabledAction(reason: StateReason): ActionState {
  return {
    family: "action",
    visibility: "visible",
    interaction: "disabled",
    activity: "idle",
    reason,
  };
}
