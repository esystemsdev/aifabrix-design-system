import type { StateReason } from "./common";

type SurfaceFailureMode = "error" | "access-denied";

export type RegionState =
  | Readonly<{ family: "region"; mode: "ready" | "loading" | "empty" | "hidden" }>
  | Readonly<{
      family: "region";
      mode: SurfaceFailureMode;
      reason: StateReason;
    }>;

export type ScreenState =
  | Readonly<{ family: "screen"; mode: "ready" | "loading" }>
  | Readonly<{
      family: "screen";
      mode: "authentication-required" | "access-denied" | "not-found" | "error";
      reason: StateReason;
    }>;
