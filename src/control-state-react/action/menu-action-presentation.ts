import { useId, type AriaAttributes } from "react";
import type { ActionState } from "../../control-state";
import { reportControlStateConflict } from "../diagnostics";
import {
  actionStateConflict,
  resolveActionPresentation,
  type ActionPresentation,
} from "./presentation";

export type MenuActionPresentationOptions = Readonly<{
  controlName: string;
  controlState?: ActionState;
  stateReasonId?: string;
  disabled?: boolean;
  ariaDescribedBy?: string;
  ariaDisabled?: AriaAttributes["aria-disabled"];
  ariaBusy?: AriaAttributes["aria-busy"];
}>;

export type MenuActionPresentation = ActionPresentation &
  Readonly<{
    effectiveDisabled: boolean;
    describedBy?: string;
    ariaDisabled?: AriaAttributes["aria-disabled"];
    ariaBusy?: AriaAttributes["aria-busy"];
    busyLabelId?: string;
  }>;

export function useMenuActionPresentation({
  controlName,
  controlState,
  stateReasonId,
  disabled,
  ariaDescribedBy,
  ariaDisabled,
  ariaBusy,
}: MenuActionPresentationOptions): MenuActionPresentation {
  const generatedId = useId();
  const presentation = resolveActionPresentation(controlState);
  reportControlStateConflict(
    actionStateConflict(controlState, disabled, controlName),
    presentation.reason,
    stateReasonId,
  );
  const busyLabelId =
    presentation.busy && presentation.busyLabel ? `${generatedId}-busy` : undefined;
  const describedBy =
    [ariaDescribedBy, stateReasonId, busyLabelId].filter(Boolean).join(" ") || undefined;

  return {
    ...presentation,
    effectiveDisabled: Boolean(disabled || presentation.disabled),
    describedBy,
    ariaDisabled: controlState ? presentation.disabled || ariaDisabled : ariaDisabled,
    ariaBusy: presentation.busy || ariaBusy,
    busyLabelId,
  };
}
