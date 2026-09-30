import type { HiddenControlState, StateReason } from "./common";

type FieldValidation =
  | Readonly<{ validation: "valid" }>
  | Readonly<{ validation: "invalid"; validationReason: StateReason }>;

type EditableFieldState = Readonly<{
  family: "field";
  visibility: "visible";
  interaction: "editable";
  activity: "idle" | "busy";
}> &
  FieldValidation;

type RestrictedFieldState = Readonly<{
  family: "field";
  visibility: "visible";
  interaction: "readonly" | "disabled";
  activity: "idle";
  reason: StateReason;
}> &
  FieldValidation;

export type FieldState = HiddenControlState<"field"> | EditableFieldState | RestrictedFieldState;
