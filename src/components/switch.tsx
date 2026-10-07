"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import type { FieldState } from "../control-state";
import {
  fieldStateConflict,
  isDiscreteSelectionKey,
  reportControlStateConflict,
  resolveDiscreteFieldPresentation,
  suppressControlMutation,
} from "../control-state-react";
import { cn } from "../utils/cn";

export type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & {
  controlState?: FieldState;
  stateReasonId?: string;
};

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  function Switch(
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
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      data-control-state={controlState ? presentation.dataState : undefined}
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-switch-background focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
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
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-card dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
  },
);
Switch.displayName = "Switch";

export { Switch };
