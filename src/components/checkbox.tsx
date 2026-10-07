"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import type { FieldState } from "../control-state";
import {
  fieldStateConflict,
  isDiscreteSelectionKey,
  reportControlStateConflict,
  resolveDiscreteFieldPresentation,
  suppressControlMutation,
} from "../control-state-react";
import { cn } from "../utils/cn";

export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  controlState?: FieldState;
  stateReasonId?: string;
};

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  function Checkbox(
    {
      className,
      controlState,
      stateReasonId,
      disabled,
      "aria-describedby": ariaDescribedBy,
      "aria-disabled": ariaDisabled,
      "aria-invalid": ariaInvalid,
      "aria-busy": ariaBusy,
      "aria-readonly": ariaReadOnly,
      onClickCapture,
      onKeyDownCapture,
      ...props
    },
    ref,
  ) {
  const presentation = resolveDiscreteFieldPresentation(controlState, disabled);
  reportControlStateConflict(
    fieldStateConflict(controlState, { disabled }),
    presentation.reason ?? presentation.validationReason,
    stateReasonId,
  );
  if (presentation.hidden) return null;
  const describedBy = [ariaDescribedBy, stateReasonId].filter(Boolean).join(" ") || undefined;

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      data-control-state={controlState ? presentation.dataState : undefined}
      className={cn(
        "peer border bg-input-background dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      disabled={presentation.effectiveDisabled}
      aria-disabled={controlState ? presentation.effectiveDisabled || ariaDisabled : ariaDisabled}
      aria-readonly={controlState ? presentation.readOnly || ariaReadOnly : ariaReadOnly}
      aria-busy={presentation.busy || ariaBusy}
      aria-invalid={presentation.invalid || ariaInvalid}
      aria-describedby={describedBy}
      onClickCapture={
        presentation.readOnly
          ? (event) => {
              onClickCapture?.(event);
              suppressControlMutation(event);
            }
          : onClickCapture
      }
      onKeyDownCapture={
        presentation.readOnly
          ? (event) => {
              onKeyDownCapture?.(event);
              if (isDiscreteSelectionKey(event.key)) {
                suppressControlMutation(event);
              }
            }
          : onKeyDownCapture
      }
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
