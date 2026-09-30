import * as React from "react";

import type { FieldState } from "../control-state";
import {
  fieldStateConflict,
  reportControlStateConflict,
  resolveFieldPresentation,
} from "../control-state-react";
import { cn } from "../utils/cn";

export type TextareaProps = React.ComponentProps<"textarea"> & {
  controlState?: FieldState;
  stateReasonId?: string;
};

function Textarea({
  className,
  controlState,
  stateReasonId,
  disabled,
  readOnly,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-busy": ariaBusy,
  ...props
}: TextareaProps) {
  const presentation = resolveFieldPresentation(controlState);
  reportControlStateConflict(
    fieldStateConflict(controlState, { disabled, readOnly }),
    presentation.reason ?? presentation.validationReason,
    stateReasonId,
  );
  if (presentation.hidden) return null;
  const describedBy = [ariaDescribedBy, stateReasonId].filter(Boolean).join(" ") || undefined;

  return (
    <textarea
      data-slot="textarea"
      data-control-state={controlState ? presentation.dataState : undefined}
      className={cn(
        "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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

export { Textarea };
