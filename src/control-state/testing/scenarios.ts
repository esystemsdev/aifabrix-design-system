import type { ActionState } from "../contracts/action-state";
import type { FieldState } from "../contracts/field-state";
import type { DisclosureState, NavigationState } from "../contracts/navigation-state";
import type { RegionState, ScreenState } from "../contracts/surface-state";
import { stateReason } from "../policy/reasons";

export type ControlStateScenario = Readonly<{
  id: string;
  label: string;
  state: ActionState | FieldState | NavigationState | DisclosureState | RegionState | ScreenState;
}>;

const permissionReason = stateReason(
  "access.denied",
  "You do not have permission to make this change.",
  "permission",
);
const availabilityReason = stateReason(
  "availability.unavailable",
  "This action is unavailable in the current state.",
  "availability",
);
const validationReason = stateReason(
  "validation.required",
  "A required value is missing.",
  "validation",
);
const runtimeReason = stateReason("runtime.failed", "The content could not be loaded.", "runtime");

export const CONTROL_STATE_SCENARIOS: readonly ControlStateScenario[] = [
  scenario("action.enabled", "Enabled action", {
    family: "action",
    visibility: "visible",
    interaction: "enabled",
    activity: "idle",
  }),
  scenario("action.permission-disabled", "Permission-disabled action", {
    family: "action",
    visibility: "visible",
    interaction: "disabled",
    activity: "idle",
    reason: permissionReason,
  }),
  scenario("action.workflow-disabled", "Availability-disabled action", {
    family: "action",
    visibility: "visible",
    interaction: "disabled",
    activity: "idle",
    reason: availabilityReason,
  }),
  scenario("action.busy", "Busy action", {
    family: "action",
    visibility: "visible",
    interaction: "enabled",
    activity: "busy",
    busyLabel: "Saving…",
  }),
  scenario("action.hidden", "Hidden action", {
    family: "action",
    visibility: "hidden",
  }),
  scenario("field.editable", "Editable field", {
    family: "field",
    visibility: "visible",
    interaction: "editable",
    activity: "idle",
    validation: "valid",
  }),
  scenario("field.readonly", "Readonly field", {
    family: "field",
    visibility: "visible",
    interaction: "readonly",
    activity: "idle",
    validation: "valid",
    reason: permissionReason,
  }),
  scenario("field.disabled", "Disabled field", {
    family: "field",
    visibility: "visible",
    interaction: "disabled",
    activity: "idle",
    validation: "valid",
    reason: availabilityReason,
  }),
  scenario("field.invalid", "Invalid field", {
    family: "field",
    visibility: "visible",
    interaction: "editable",
    activity: "idle",
    validation: "invalid",
    validationReason,
  }),
  scenario("field.hidden", "Hidden field", {
    family: "field",
    visibility: "hidden",
  }),
  ...navigationScenarios(permissionReason),
  ...surfaceScenarios(permissionReason, runtimeReason),
];

function scenario(
  id: string,
  label: string,
  state: ControlStateScenario["state"],
): ControlStateScenario {
  return Object.freeze({ id, label, state });
}

function navigationScenarios(reason: ReturnType<typeof stateReason>): ControlStateScenario[] {
  return [
    scenario("navigation.inactive", "Inactive navigation", {
      family: "navigation",
      visibility: "visible",
      interaction: "inactive",
    }),
    scenario("navigation.active", "Active navigation", {
      family: "navigation",
      visibility: "visible",
      interaction: "active",
    }),
    scenario("navigation.disabled", "Disabled navigation", {
      family: "navigation",
      visibility: "visible",
      interaction: "disabled",
      reason,
    }),
    scenario("navigation.hidden", "Hidden navigation", {
      family: "navigation",
      visibility: "hidden",
    }),
    scenario("disclosure.enabled", "Enabled disclosure", {
      family: "disclosure",
      visibility: "visible",
      interaction: "enabled",
    }),
    scenario("disclosure.disabled", "Disabled disclosure", {
      family: "disclosure",
      visibility: "visible",
      interaction: "disabled",
      reason,
    }),
    scenario("disclosure.hidden", "Hidden disclosure", {
      family: "disclosure",
      visibility: "hidden",
    }),
  ];
}

function surfaceScenarios(
  accessReason: ReturnType<typeof stateReason>,
  errorReason: ReturnType<typeof stateReason>,
): ControlStateScenario[] {
  const simpleRegionModes = ["ready", "loading", "empty", "hidden"] as const;
  const simpleScreenModes = ["loading", "ready"] as const;
  return [
    ...simpleRegionModes.map((mode) =>
      scenario(`region.${mode}`, `Region ${mode}`, { family: "region", mode }),
    ),
    scenario("region.error", "Region error", {
      family: "region",
      mode: "error",
      reason: errorReason,
    }),
    scenario("region.access-denied", "Region access denied", {
      family: "region",
      mode: "access-denied",
      reason: accessReason,
    }),
    ...simpleScreenModes.map((mode) =>
      scenario(`screen.${mode}`, `Screen ${mode}`, { family: "screen", mode }),
    ),
    ...["authentication-required", "access-denied", "not-found", "error"].map((mode) =>
      scenario(`screen.${mode}`, `Screen ${mode}`, {
        family: "screen",
        mode,
        reason: mode === "error" ? errorReason : accessReason,
      } as ScreenState),
    ),
  ];
}
