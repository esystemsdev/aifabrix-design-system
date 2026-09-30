import * as React from "react";

import type { FieldState } from "../control-state";
import {
  fieldStateConflict,
  reportControlStateConflict,
  resolveFieldPresentation,
} from "../control-state-react";
import { cn } from "../utils/cn";

export type InputProps = React.ComponentProps<"input"> & {
  controlState?: FieldState;
  stateReasonId?: string;
};

function Input({
  className,
  type,
  controlState,
  stateReasonId,
  disabled,
  readOnly,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-busy": ariaBusy,
  ...props
}: InputProps) {
  const presentation = resolveFieldPresentation(controlState);
  reportControlStateConflict(
    fieldStateConflict(controlState, { disabled, readOnly }),
    presentation.reason ?? presentation.validationReason,
    stateReasonId,
  );
  if (presentation.hidden) return null;
  const describedBy = [ariaDescribedBy, stateReasonId].filter(Boolean).join(" ") || undefined;

  return (
    <input
      type={type}
      data-slot="input"
      data-control-state={controlState ? presentation.dataState : undefined}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      disabled={Boolean(disabled || presentation.disabled)}
      readOnly={Boolean(readOnly || presentation.readOnly)}
      aria-busy={presentation.busy || ariaBusy}
      aria-invalid={presentation.invalid || ariaInvalid}
      aria-describedby={describedBy}
      {...props}
    />
  );
}

export { Input };
