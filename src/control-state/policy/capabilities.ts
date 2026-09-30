export const CONTROL_STATE_CAPABILITIES = Object.freeze({
  action: ["enabled", "disabled", "busy", "hidden"],
  field: ["editable", "readonly", "disabled", "invalid", "hidden"],
  navigation: ["inactive", "active", "disabled", "hidden"],
  disclosure: ["enabled", "disabled", "hidden"],
  region: ["ready", "loading", "empty", "error", "access-denied", "hidden"],
  screen: ["loading", "ready", "authentication-required", "access-denied", "not-found", "error"],
} as const);

export type ControlStateFamily = keyof typeof CONTROL_STATE_CAPABILITIES;

export function supportsControlState(family: ControlStateFamily, state: string): boolean {
  return (CONTROL_STATE_CAPABILITIES[family] as readonly string[]).includes(state);
}
