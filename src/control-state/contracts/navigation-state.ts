import type { HiddenControlState, StateReason } from "./common";

export type NavigationState =
  | HiddenControlState<"navigation">
  | Readonly<{
      family: "navigation";
      visibility: "visible";
      interaction: "inactive" | "active";
    }>
  | Readonly<{
      family: "navigation";
      visibility: "visible";
      interaction: "disabled";
      reason: StateReason;
    }>;

export type DisclosureState =
  | HiddenControlState<"disclosure">
  | Readonly<{
      family: "disclosure";
      visibility: "visible";
      interaction: "enabled";
    }>
  | Readonly<{
      family: "disclosure";
      visibility: "visible";
      interaction: "disabled";
      reason: StateReason;
    }>;
