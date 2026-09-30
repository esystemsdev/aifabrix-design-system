import React from "react";
import type { ActionState } from "../control-state";
import { useMenuActionPresentation } from "../control-state-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { buttonVariants } from "./button";
import { DialogActionBusyLabel } from "./dialog-action-control-state";
import { cn } from "../utils/cn";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** Primary action label. Omitted, null, undefined, or blank → "Confirm". */
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  variant?: "default" | "destructive";
  confirmControlState?: ActionState;
  confirmStateReasonId?: string;
  cancelControlState?: ActionState;
  cancelStateReasonId?: string;
  className?: string;
  overlayClassName?: string;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText: confirmTextProp,
  cancelText = "Cancel",
  onConfirm,
  variant = "default",
  confirmControlState,
  confirmStateReasonId,
  cancelControlState,
  cancelStateReasonId,
  className,
  overlayClassName,
}: ConfirmationDialogProps) {
  const confirmText =
    confirmTextProp == null || String(confirmTextProp).trim() === "" ? "Confirm" : confirmTextProp;
  const confirmPresentation = useMenuActionPresentation({
    controlName: "ConfirmationDialogConfirm",
    controlState: confirmControlState,
    stateReasonId: confirmStateReasonId,
  });
  const cancelPresentation = useMenuActionPresentation({
    controlName: "ConfirmationDialogCancel",
    controlState: cancelControlState,
    stateReasonId: cancelStateReasonId,
  });

  const handleConfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent Radix from auto-closing before async onConfirm finishes.
    event.preventDefault();
    void (async () => {
      try {
        await onConfirm();
        onOpenChange(false);
      } catch {
        // Keep dialog open when confirm handler reports failure.
      }
    })();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={className} overlayClassName={overlayClassName}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {cancelPresentation.hidden ? null : (
            <>
              <AlertDialogCancel
                data-control-state={cancelControlState ? cancelPresentation.dataState : undefined}
                disabled={cancelControlState ? cancelPresentation.effectiveDisabled : undefined}
                aria-disabled={cancelPresentation.ariaDisabled}
                aria-busy={cancelPresentation.ariaBusy}
                aria-describedby={cancelPresentation.describedBy}
              >
                {cancelText}
              </AlertDialogCancel>
              <DialogActionBusyLabel
                id={cancelPresentation.busyLabelId}
                label={cancelPresentation.busyLabel}
              />
            </>
          )}
          {confirmPresentation.hidden ? null : (
            <>
              <AlertDialogAction
                data-control-state={confirmControlState ? confirmPresentation.dataState : undefined}
                disabled={confirmControlState ? confirmPresentation.effectiveDisabled : undefined}
                aria-disabled={confirmPresentation.ariaDisabled}
                aria-busy={confirmPresentation.ariaBusy}
                aria-describedby={confirmPresentation.describedBy}
                onClick={handleConfirm}
                className={cn(
                  variant === "destructive" && buttonVariants({ variant: "destructive" }),
                )}
              >
                {confirmText}
              </AlertDialogAction>
              <DialogActionBusyLabel
                id={confirmPresentation.busyLabelId}
                label={confirmPresentation.busyLabel}
              />
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
