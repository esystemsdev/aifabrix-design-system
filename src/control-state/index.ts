export type { ActionState, VisibleActionState } from "./contracts/action-state";
export type {
  AccessResolution,
  ControlActivity,
  HiddenControlState,
  StateReason,
  StateReasonSource,
} from "./contracts/common";
export type { FieldState } from "./contracts/field-state";
export type { DisclosureState, NavigationState } from "./contracts/navigation-state";
export type { RegionState, ScreenState } from "./contracts/surface-state";
export {
  CONTROL_STATE_CAPABILITIES,
  supportsControlState,
  type ControlStateFamily,
} from "./policy/capabilities";
export { resolveActionState, type ActionResolutionInput } from "./policy/precedence";
export { pendingAccessReason, stateReason } from "./policy/reasons";
export { CONTROL_STATE_SCENARIOS, type ControlStateScenario } from "./testing/scenarios";
