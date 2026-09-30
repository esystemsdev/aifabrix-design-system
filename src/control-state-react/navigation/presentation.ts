import type { DisclosureState, NavigationState, StateReason } from "../../control-state";

export type NavigationPresentation = Readonly<{
  hidden: boolean;
  disabled: boolean;
  current?: "page";
  reason?: StateReason;
}>;

export function resolveNavigationPresentation(state: NavigationState): NavigationPresentation {
  if (state.visibility === "hidden") {
    return { hidden: true, disabled: true };
  }
  if (state.interaction === "disabled") {
    return { hidden: false, disabled: true, reason: state.reason };
  }
  return {
    hidden: false,
    disabled: false,
    current: state.interaction === "active" ? "page" : undefined,
  };
}

export function resolveDisclosurePresentation(
  state: DisclosureState,
): Omit<NavigationPresentation, "current"> {
  if (state.visibility === "hidden") {
    return { hidden: true, disabled: true };
  }
  if (state.interaction === "disabled") {
    return { hidden: false, disabled: true, reason: state.reason };
  }
  return { hidden: false, disabled: false };
}
