"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, CircleIcon } from "lucide-react";

import type { ActionState } from "../control-state";
import { useMenuActionPresentation } from "../control-state-react";
import { cn } from "../utils/cn";

type MenuActionStateProps = {
  controlState?: ActionState;
  stateReasonId?: string;
};

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  controlState,
  stateReasonId,
  disabled,
  onClick,
  onSelect,
  onCheckedChange,
  "aria-describedby": ariaDescribedBy,
  "aria-disabled": ariaDisabled,
  "aria-busy": ariaBusy,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & MenuActionStateProps) {
  const presentation = useMenuActionPresentation({
    controlName: "DropdownMenuCheckboxItem",
    controlState,
    stateReasonId,
    disabled,
    ariaDescribedBy,
    ariaDisabled,
    ariaBusy,
  });
  if (presentation.hidden) return null;

  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-control-state={controlState ? presentation.dataState : undefined}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      disabled={controlState ? presentation.effectiveDisabled : disabled}
      aria-disabled={presentation.ariaDisabled}
      aria-busy={presentation.ariaBusy}
      aria-describedby={presentation.describedBy}
      onClick={
        controlState
          ? (event) => {
              if (presentation.effectiveDisabled) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              onClick?.(event);
            }
          : onClick
      }
      onSelect={
        controlState
          ? (event) => {
              if (presentation.effectiveDisabled) {
                event.preventDefault();
                return;
              }
              onSelect?.(event);
            }
          : onSelect
      }
      onCheckedChange={controlState && presentation.effectiveDisabled ? undefined : onCheckedChange}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
      <MenuBusyLabel id={presentation.busyLabelId} label={presentation.busyLabel} />
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({
  className,
  children,
  controlState,
  stateReasonId,
  disabled,
  onClick,
  onSelect,
  "aria-describedby": ariaDescribedBy,
  "aria-disabled": ariaDisabled,
  "aria-busy": ariaBusy,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & MenuActionStateProps) {
  const presentation = useMenuActionPresentation({
    controlName: "DropdownMenuRadioItem",
    controlState,
    stateReasonId,
    disabled,
    ariaDescribedBy,
    ariaDisabled,
    ariaBusy,
  });
  if (presentation.hidden) return null;

  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-control-state={controlState ? presentation.dataState : undefined}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      disabled={controlState ? presentation.effectiveDisabled : disabled}
      aria-disabled={presentation.ariaDisabled}
      aria-busy={presentation.ariaBusy}
      aria-describedby={presentation.describedBy}
      onClick={
        controlState
          ? (event) => {
              if (presentation.effectiveDisabled) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              onClick?.(event);
            }
          : onClick
      }
      onSelect={
        controlState
          ? (event) => {
              if (presentation.effectiveDisabled) {
                event.preventDefault();
                return;
              }
              onSelect?.(event);
            }
          : onSelect
      }
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
      <MenuBusyLabel id={presentation.busyLabelId} label={presentation.busyLabel} />
    </DropdownMenuPrimitive.RadioItem>
  );
}

function MenuBusyLabel({ id, label }: { id?: string; label?: string }) {
  return id && label ? (
    <span id={id} className="sr-only">
      {label}
    </span>
  ) : null;
}

export { DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem };
