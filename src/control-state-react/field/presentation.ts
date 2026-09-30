import type { FieldState, StateReason } from "../../control-state";

export type FieldPresentation = Readonly<{
  hidden: boolean;
  disabled: boolean;
  readOnly: boolean;
  busy: boolean;
  invalid: boolean;
  reason?: StateReason;
  validationReason?: StateReason;
  dataState: "hidden" | "editable" | "readonly" | "disabled" | "busy";
}>;

export function resolveFieldPresentation(state?: FieldState): FieldPresentation {
  if (!state) return defaultFieldPresentation;
  if (state.visibility === "hidden") {
    return { ...defaultFieldPresentation, hidden: true, dataState: "hidden" };
  }
  const restrictedReason = state.interaction === "editable" ? undefined : state.reason;
  return {
    hidden: false,
    disabled: state.interaction === "disabled" || state.activity === "busy",
    readOnly: state.interaction === "readonly",
    busy: state.activity === "busy",
    invalid: state.validation === "invalid",
    reason: restrictedReason,
    validationReason: state.validation === "invalid" ? state.validationReason : undefined,
    dataState: state.activity === "busy" ? "busy" : state.interaction,
  };
}

export function fieldStateConflict(
  state: FieldState | undefined,
  native: { disabled?: boolean; readOnly?: boolean },
): string | undefined {
  if (!state || state.visibility === "hidden") return undefined;
  if (
    native.disabled !== undefined &&
    native.disabled !== (state.interaction === "disabled" || state.activity === "busy")
  ) {
    return "Field received contradictory disabled and controlState values";
  }
  if (native.readOnly !== undefined && native.readOnly !== (state.interaction === "readonly")) {
    return "Field received contradictory readOnly and controlState values";
  }
  return undefined;
}

const defaultFieldPresentation: FieldPresentation = {
  hidden: false,
  disabled: false,
  readOnly: false,
  busy: false,
  invalid: false,
  dataState: "editable",
};
