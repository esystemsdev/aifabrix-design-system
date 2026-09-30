import type { ActionState, FieldState } from "../index";

export const enabledActionTypeFixture: ActionState = {
  family: "action",
  visibility: "visible",
  interaction: "enabled",
  activity: "idle",
};

export const readonlyActionTypeFixture: ActionState = {
  family: "action",
  visibility: "visible",
  // @ts-expect-error Actions do not support readonly interaction.
  interaction: "readonly",
  activity: "idle",
};

// @ts-expect-error Disabled actions require a reason.
export const disabledActionWithoutReason: ActionState = {
  family: "action",
  visibility: "visible",
  interaction: "disabled",
  activity: "idle",
};

export const hiddenInvalidField: FieldState = {
  family: "field",
  visibility: "hidden",
  // @ts-expect-error Hidden fields cannot expose validation.
  validation: "invalid",
};
