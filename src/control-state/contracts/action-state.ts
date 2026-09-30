import type { HiddenControlState, StateReason } from "./common";

export type VisibleActionState =
  | Readonly<{
      family: "action";
      visibility: "visible";
      interaction: "enabled";
      activity: "idle";
    }>
  | Readonly<{
      family: "action";
      visibility: "visible";
      interaction: "enabled";
      activity: "busy";
      busyLabel: string;
    }>
  | Readonly<{
      family: "action";
      visibility: "visible";
      interaction: "disabled";
      activity: "idle";
      reason: StateReason;
    }>;

export type ActionState = HiddenControlState<"action"> | VisibleActionState;
