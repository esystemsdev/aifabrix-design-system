export type StateReasonSource =
  | "permission"
  | "workflow"
  | "validation"
  | "runtime"
  | "availability"
  | "policy";

export type StateReason = Readonly<{
  code: string;
  message: string;
  source: StateReasonSource;
}>;

export type ControlActivity = "idle" | "busy";

export type HiddenControlState<Family extends string> = Readonly<{
  family: Family;
  visibility: "hidden";
}>;

export type AccessResolution = "pending" | "allowed" | "denied";
