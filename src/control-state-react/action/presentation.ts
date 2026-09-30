import type { ActionState, StateReason } from "../../control-state";

export type ActionPresentation = Readonly<{
  hidden: boolean;
  disabled: boolean;
  busy: boolean;
  busyLabel?: string;
  reason?: StateReason;
  dataState: "hidden" | "enabled" | "disabled" | "busy";
}>;

export function resolveActionPresentation(state?: ActionState): ActionPresentation {
  if (!state) {
    return {
      hidden: false,
      disabled: false,
      busy: false,
      dataState: "enabled",
    };
  }
  if (state.visibility === "hidden") {
    return {
      hidden: true,
      disabled: true,
      busy: false,
      dataState: "hidden",
    };
  }
  if (state.interaction === "disabled") {
    return {
      hidden: false,
      disabled: true,
      busy: false,
      reason: state.reason,
      dataState: "disabled",
    };
  }
  if (state.activity === "busy") {
    return {
      hidden: false,
      disabled: true,
      busy: true,
      busyLabel: state.busyLabel,
      dataState: "busy",
    };
  }
  return {
    hidden: false,
    disabled: false,
    busy: false,
    dataState: "enabled",
  };
}

export function actionStateConflict(
  state: ActionState | undefined,
  nativeDisabled: boolean | undefined,
  controlName = "Button",
): string | undefined {
  if (!state || nativeDisabled === undefined || state.visibility === "hidden") {
    return undefined;
  }
  const stateDisabled = state.interaction === "disabled" || state.activity === "busy";
  return stateDisabled === nativeDisabled
    ? undefined
    : `${controlName} received contradictory disabled and controlState values`;
}
