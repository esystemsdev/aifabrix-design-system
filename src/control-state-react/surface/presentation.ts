import type { RegionState, ScreenState, StateReason } from "../../control-state";

export type SurfacePresentation = Readonly<{
  hidden: boolean;
  busy: boolean;
  role?: "status" | "alert";
  reason?: StateReason;
  dataState: RegionState["mode"] | ScreenState["mode"];
}>;

export function resolveSurfacePresentation(state: RegionState | ScreenState): SurfacePresentation {
  if (state.mode === "hidden") {
    return { hidden: true, busy: false, dataState: state.mode };
  }
  if (state.mode === "loading") {
    return {
      hidden: false,
      busy: true,
      role: "status",
      dataState: state.mode,
    };
  }
  if (
    state.mode === "error" ||
    state.mode === "access-denied" ||
    state.mode === "authentication-required"
  ) {
    return {
      hidden: false,
      busy: false,
      role: "alert",
      reason: state.reason,
      dataState: state.mode,
    };
  }
  return {
    hidden: false,
    busy: false,
    role: state.mode === "empty" || state.mode === "not-found" ? "status" : undefined,
    reason: "reason" in state ? state.reason : undefined,
    dataState: state.mode,
  };
}
