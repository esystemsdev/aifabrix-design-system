"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { useMenuActionPresentation } from "../control-state-react";
import { DialogActionBusyLabel, type DialogActionStateProps } from "./dialog-action-control-state";
import { cn } from "../utils/cn";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

const SheetTrigger = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Trigger> & DialogActionStateProps
>(
  (
    {
      children,
      controlState,
      stateReasonId,
      disabled,
      "aria-describedby": ariaDescribedBy,
      "aria-disabled": ariaDisabled,
      "aria-busy": ariaBusy,
      ...props
    },
    ref,
  ) => {
    const presentation = useMenuActionPresentation({
      controlName: "SheetTrigger",
      controlState,
      stateReasonId,
      disabled,
      ariaDescribedBy,
      ariaDisabled,
      ariaBusy,
    });
    if (presentation.hidden) return null;

    return (
      <>
        <SheetPrimitive.Trigger
          ref={ref}
          data-slot="sheet-trigger"
          data-control-state={controlState ? presentation.dataState : undefined}
          disabled={controlState ? presentation.effectiveDisabled : disabled}
          aria-disabled={presentation.ariaDisabled}
          aria-busy={presentation.ariaBusy}
          aria-describedby={presentation.describedBy}
          {...props}
        >
          {children}
        </SheetPrimitive.Trigger>
        <DialogActionBusyLabel id={presentation.busyLabelId} label={presentation.busyLabel} />
      </>
    );
  },
);
SheetTrigger.displayName = SheetPrimitive.Trigger.displayName;

const SheetClose = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Close> & DialogActionStateProps
>(
  (
    {
      children,
      controlState,
      stateReasonId,
      disabled,
      "aria-describedby": ariaDescribedBy,
      "aria-disabled": ariaDisabled,
      "aria-busy": ariaBusy,
      ...props
    },
    ref,
  ) => {
    const presentation = useMenuActionPresentation({
      controlName: "SheetClose",
      controlState,
      stateReasonId,
      disabled,
      ariaDescribedBy,
      ariaDisabled,
      ariaBusy,
    });
    if (presentation.hidden) return null;

    return (
      <>
        <SheetPrimitive.Close
          ref={ref}
          data-slot="sheet-close"
          data-control-state={controlState ? presentation.dataState : undefined}
          disabled={controlState ? presentation.effectiveDisabled : disabled}
          aria-disabled={presentation.ariaDisabled}
          aria-busy={presentation.ariaBusy}
          aria-describedby={presentation.describedBy}
          {...props}
        >
          {children}
        </SheetPrimitive.Close>
        <DialogActionBusyLabel id={presentation.busyLabelId} label={presentation.busyLabel} />
      </>
    );
  },
);
SheetClose.displayName = SheetPrimitive.Close.displayName;

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <SheetPrimitive.Overlay
      ref={ref}
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
});
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
    side?: "top" | "right" | "bottom" | "left";
  }
>(({ className, children, side = "right", ...props }, ref) => {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-0 overflow-hidden p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          title="Close"
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-6 right-6 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = SheetPrimitive.Content.displayName;

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 pr-10", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2", className)}
      {...props}
    />
  );
}

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => {
  return (
    <SheetPrimitive.Title
      ref={ref}
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
});
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => {
  return (
    <SheetPrimitive.Description
      ref={ref}
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
});
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
