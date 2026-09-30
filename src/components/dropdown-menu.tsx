"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronRightIcon } from "lucide-react";

import type { ActionState } from "../control-state";
import { useMenuActionPresentation } from "../control-state-react";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./dropdown-menu-selection-items";
import { cn } from "../utils/cn";

type MenuActionStateProps = {
  controlState?: ActionState;
  stateReasonId?: string;
};

const DropdownMenuCloseContext = React.createContext<(() => void) | undefined>(undefined);
const DropdownMenuSubCloseContext = React.createContext<(() => void) | undefined>(undefined);

function useControllableMenuOpen(
  openProp: boolean | undefined,
  defaultOpen: boolean | undefined,
  onOpenChange: ((open: boolean) => void) | undefined,
) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : uncontrolledOpen;
  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!controlled) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [controlled, onOpenChange],
  );
  const close = React.useCallback(() => {
    if (open) setOpen(false);
  }, [open, setOpen]);
  return { open, setOpen, close };
}

function useCloseMenuOnRestriction(restricted: boolean, closeMenu: (() => void) | undefined) {
  const wasRestricted = React.useRef(false);
  React.useEffect(() => {
    if (restricted && !wasRestricted.current) closeMenu?.();
    wasRestricted.current = restricted;
  }, [closeMenu, restricted]);
}

function DropdownMenu({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  const { open, setOpen, close } = useControllableMenuOpen(openProp, defaultOpen, onOpenChange);
  return (
    <DropdownMenuCloseContext.Provider value={close}>
      <DropdownMenuPrimitive.Root
        data-slot="dropdown-menu"
        open={open}
        onOpenChange={setOpen}
        {...props}
      />
    </DropdownMenuCloseContext.Provider>
  );
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger({
  controlState,
  stateReasonId,
  disabled,
  children,
  "aria-describedby": ariaDescribedBy,
  "aria-disabled": ariaDisabled,
  "aria-busy": ariaBusy,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger> & MenuActionStateProps) {
  const presentation = useMenuActionPresentation({
    controlName: "DropdownMenuTrigger",
    controlState,
    stateReasonId,
    disabled,
    ariaDescribedBy,
    ariaDisabled,
    ariaBusy,
  });
  const closeMenu = React.useContext(DropdownMenuCloseContext);
  useCloseMenuOnRestriction(presentation.hidden || presentation.disabled, closeMenu);
  if (presentation.hidden) return null;

  return (
    <>
      <DropdownMenuPrimitive.Trigger
        data-slot="dropdown-menu-trigger"
        data-control-state={controlState ? presentation.dataState : undefined}
        disabled={controlState ? presentation.effectiveDisabled : disabled}
        aria-disabled={presentation.ariaDisabled}
        aria-busy={presentation.ariaBusy}
        aria-describedby={presentation.describedBy}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Trigger>
      <MenuBusyLabel id={presentation.busyLabelId} label={presentation.busyLabel} />
    </>
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  controlState,
  stateReasonId,
  disabled,
  children,
  asChild,
  onClick,
  onSelect,
  "aria-describedby": ariaDescribedBy,
  "aria-disabled": ariaDisabled,
  "aria-busy": ariaBusy,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
} & MenuActionStateProps) {
  const presentation = useMenuActionPresentation({
    controlName: "DropdownMenuItem",
    controlState,
    stateReasonId,
    disabled,
    ariaDescribedBy,
    ariaDisabled,
    ariaBusy,
  });
  if (presentation.hidden) return null;

  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      data-control-state={controlState ? presentation.dataState : undefined}
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        "[&_svg:not([class*='text-'])]:text-current",
        "data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20",
        className,
      )}
      disabled={controlState ? presentation.effectiveDisabled : disabled}
      aria-disabled={presentation.ariaDisabled}
      aria-busy={presentation.ariaBusy}
      aria-describedby={presentation.describedBy}
      asChild={asChild}
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
      {menuItemSlotChildren(asChild, children, presentation.busyLabelId, presentation.busyLabel)}
    </DropdownMenuPrimitive.Item>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
      {...props}
    />
  );
}

function DropdownMenuSub({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  const { open, setOpen, close } = useControllableMenuOpen(openProp, defaultOpen, onOpenChange);
  return (
    <DropdownMenuSubCloseContext.Provider value={close}>
      <DropdownMenuPrimitive.Sub
        data-slot="dropdown-menu-sub"
        open={open}
        onOpenChange={setOpen}
        {...props}
      />
    </DropdownMenuSubCloseContext.Provider>
  );
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  controlState,
  stateReasonId,
  disabled,
  onClick,
  "aria-describedby": ariaDescribedBy,
  "aria-disabled": ariaDisabled,
  "aria-busy": ariaBusy,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
} & MenuActionStateProps) {
  const presentation = useMenuActionPresentation({
    controlName: "DropdownMenuSubTrigger",
    controlState,
    stateReasonId,
    disabled,
    ariaDescribedBy,
    ariaDisabled,
    ariaBusy,
  });
  const closeSubmenu = React.useContext(DropdownMenuSubCloseContext);
  useCloseMenuOnRestriction(presentation.hidden || presentation.disabled, closeSubmenu);
  if (presentation.hidden) return null;

  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      data-control-state={controlState ? presentation.dataState : undefined}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
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
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
      <MenuBusyLabel id={presentation.busyLabelId} label={presentation.busyLabel} />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

function MenuBusyLabel({ id, label }: { id?: string; label?: string }) {
  return id && label ? (
    <span id={id} className="sr-only">
      {label}
    </span>
  ) : null;
}

/** Radix `asChild` Slot requires exactly one element child. */
function menuItemSlotChildren(
  asChild: boolean | undefined,
  children: React.ReactNode,
  busyLabelId?: string,
  busyLabel?: string,
) {
  if (asChild) {
    return children;
  }
  return (
    <>
      {children}
      <MenuBusyLabel id={busyLabelId} label={busyLabel} />
    </>
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
