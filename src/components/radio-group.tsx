"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";

import type { FieldState } from "../control-state";
import {
  fieldStateConflict,
  isDiscreteSelectionKey,
  reportControlStateConflict,
  resolveDiscreteFieldPresentation,
  suppressControlMutation,
} from "../control-state-react";
import { cn } from "../utils/cn";

export type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root> & {
  controlState?: FieldState;
  stateReasonId?: string;
};

function RadioGroup({
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
}: RadioGroupProps) {
  const presentation = resolveDiscreteFieldPresentation(controlState, disabled);
  reportControlStateConflict(
    fieldStateConflict(controlState, { disabled }),
    presentation.reason ?? presentation.validationReason,
    stateReasonId,
  );
  if (presentation.hidden) return null;
  const describedBy = [ariaDescribedBy, stateReasonId].filter(Boolean).join(" ") || undefined;

  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      data-control-state={controlState ? presentation.dataState : undefined}
      className={cn("grid gap-3", className)}
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
              if (isDiscreteSelectionKey(event.key, true)) {
                suppressControlMutation(event);
              }
            }
          : onKeyDownCapture
      }
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
