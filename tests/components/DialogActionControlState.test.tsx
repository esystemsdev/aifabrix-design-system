import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../src/components/alert-dialog";
import { ConfirmationDialog } from "../../src/components/confirmation-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../../src/components/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "../../src/components/sheet";
import { stateReason, type ActionState } from "../../src/control-state";
import { StateReasonText } from "../../src/control-state-react";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
if (!globalThis.PointerEvent) {
  globalThis.PointerEvent = MouseEvent as typeof PointerEvent;
}
if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
}

const reason = stateReason(
  "workflow.unavailable",
  "Complete the current workflow step first.",
  "workflow",
);
const enabledState: ActionState = {
  family: "action",
  visibility: "visible",
  interaction: "enabled",
  activity: "idle",
};
const disabledState: ActionState = {
  family: "action",
  visibility: "visible",
  interaction: "disabled",
  activity: "idle",
  reason,
};
const disabledWithoutReason: ActionState = {
  family: "action",
  visibility: "visible",
  interaction: "disabled",
  activity: "idle",
};
const busyState: ActionState = {
  family: "action",
  visibility: "visible",
  interaction: "enabled",
  activity: "busy",
  busyLabel: "Completing dialog action",
};
const hiddenState: ActionState = {
  family: "action",
  visibility: "hidden",
};

describe("Dialog family controlState", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body
      .querySelectorAll(
        '[data-slot="dialog-content"], [data-slot="alert-dialog-content"], [data-slot="sheet-content"]',
      )
      .forEach((element) => element.remove());
    container.remove();
  });

  it("freezes no-state Dialog trigger, portal, close, and event behavior", () => {
    const onOpenChange = vi.fn();
    act(() =>
      root.render(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger>Open details</DialogTrigger>
          <DialogContent>
            <DialogTitle>Details</DialogTitle>
            <DialogDescription>Review details.</DialogDescription>
            <DialogClose>Done</DialogClose>
          </DialogContent>
        </Dialog>,
      ),
    );
    const trigger = requiredElement(container, '[data-slot="dialog-trigger"]');

    expect({
      controlState: trigger.getAttribute("data-control-state"),
      disabled: (trigger as HTMLButtonElement).disabled,
      slot: trigger.getAttribute("data-slot"),
      state: trigger.getAttribute("data-state"),
      tag: trigger.tagName.toLowerCase(),
      type: trigger.getAttribute("type"),
    }).toEqual({
      controlState: null,
      disabled: false,
      slot: "dialog-trigger",
      state: "closed",
      tag: "button",
      type: "button",
    });

    click(trigger);
    const content = requiredBodyElement('[data-slot="dialog-content"]');
    expect(content.getAttribute("role")).toBe("dialog");
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    click(requiredBodyElement('[data-slot="dialog-close"]'));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it.each([
    ["disabled", disabledState],
    ["busy", busyState],
  ] as const)("prevents a %s Dialog trigger from opening", (_, state) => {
    act(() =>
      root.render(
        <>
          <Dialog>
            <DialogTrigger controlState={state} stateReasonId="dialog-reason">
              Open details
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Details</DialogTitle>
              <DialogDescription>Review details.</DialogDescription>
            </DialogContent>
          </Dialog>
          <StateReasonText id="dialog-reason" reason={reason} />
        </>,
      ),
    );
    const trigger = requiredElement(container, '[data-slot="dialog-trigger"]');

    expect((trigger as HTMLButtonElement).disabled).toBe(true);
    expect(trigger.getAttribute("aria-disabled")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toContain("dialog-reason");
    click(trigger);
    expect(document.body.querySelector('[data-slot="dialog-content"]')).toBeNull();
    if (state === busyState) {
      expect(trigger.getAttribute("aria-busy")).toBe("true");
      expect(container.textContent).toContain("Completing dialog action");
    }
  });

  it("removes hidden triggers without changing root ownership", () => {
    const onOpenChange = vi.fn();
    act(() =>
      root.render(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger controlState={hiddenState}>Open details</DialogTrigger>
          <DialogContent>
            <DialogTitle>Details</DialogTitle>
            <DialogDescription>Review details.</DialogDescription>
          </DialogContent>
        </Dialog>,
      ),
    );

    expect(container.querySelector('[data-slot="dialog-trigger"]')).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("keeps restricted Dialog close actions from dismissing", () => {
    const onOpenChange = vi.fn();
    const render = (state: ActionState) =>
      act(() =>
        root.render(
          <Dialog defaultOpen onOpenChange={onOpenChange}>
            <DialogContent>
              <DialogTitle>Details</DialogTitle>
              <DialogDescription>Review details.</DialogDescription>
              <DialogClose controlState={state}>Done</DialogClose>
            </DialogContent>
          </Dialog>,
        ),
      );

    render(disabledWithoutReason);
    click(requiredBodyElement('[data-slot="dialog-close"]'));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(document.body.querySelector('[data-slot="dialog-content"]')).not.toBeNull();

    render(enabledState);
    click(requiredBodyElement('[data-slot="dialog-close"]'));
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("suppresses restricted AlertDialog actions and preserves enabled callbacks", () => {
    const onAction = vi.fn();
    const onCancel = vi.fn();
    const render = (state: ActionState) =>
      act(() =>
        root.render(
          <AlertDialog defaultOpen>
            <AlertDialogContent>
              <AlertDialogTitle>Continue?</AlertDialogTitle>
              <AlertDialogDescription>Choose an action.</AlertDialogDescription>
              <AlertDialogCancel controlState={state} onClick={onCancel}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction controlState={state} onClick={onAction}>
                Continue
              </AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>,
        ),
      );

    render(busyState);
    click(requiredBodyElement('[data-control-state="busy"]:first-of-type'));
    requiredBodyElements('[data-control-state="busy"]').forEach(click);
    expect(onAction).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    expect(document.body.querySelector('[data-slot="alert-dialog-content"]')).not.toBeNull();

    render(enabledState);
    const actions = requiredBodyElements('[data-control-state="enabled"]');
    click(actions[actions.length - 1]);
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("forwards ConfirmationDialog action states and preserves async completion", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    const render = (state: ActionState) =>
      act(() =>
        root.render(
          <ConfirmationDialog
            open
            onOpenChange={onOpenChange}
            title="Delete item?"
            description="This cannot be undone."
            onConfirm={onConfirm}
            confirmControlState={state}
            cancelControlState={disabledWithoutReason}
          />,
        ),
      );

    render(busyState);
    const busyConfirm = requiredBodyElement('[data-control-state="busy"]');
    click(busyConfirm);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();

    render(enabledState);
    await act(async () => click(requiredBodyElement('[data-control-state="enabled"]')));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("keeps ConfirmationDialog open when async confirmation fails", async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error("failed"));
    const onOpenChange = vi.fn();
    act(() =>
      root.render(
        <ConfirmationDialog
          open
          onOpenChange={onOpenChange}
          title="Delete item?"
          description="This cannot be undone."
          onConfirm={onConfirm}
          confirmControlState={enabledState}
        />,
      ),
    );

    await act(async () => click(requiredBodyElement('[data-control-state="enabled"]')));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(document.body.querySelector('[data-slot="alert-dialog-content"]')).not.toBeNull();
  });

  it("applies the same trigger and close contract to Sheet", () => {
    const onOpenChange = vi.fn();
    const render = (triggerState: ActionState, closeState: ActionState) =>
      act(() =>
        root.render(
          <Sheet onOpenChange={onOpenChange}>
            <SheetTrigger controlState={triggerState}>Open panel</SheetTrigger>
            <SheetContent side="left">
              <SheetTitle>Panel</SheetTitle>
              <SheetDescription>Review panel.</SheetDescription>
              <SheetClose controlState={closeState}>Done</SheetClose>
            </SheetContent>
          </Sheet>,
        ),
      );

    render(disabledWithoutReason, disabledWithoutReason);
    click(requiredElement(container, '[data-slot="sheet-trigger"]'));
    expect(document.body.querySelector('[data-slot="sheet-content"]')).toBeNull();

    render(enabledState, busyState);
    click(requiredElement(container, '[data-slot="sheet-trigger"]'));
    expect(requiredBodyElement('[data-slot="sheet-content"]')).not.toBeNull();
    click(requiredBodyElement('[data-slot="sheet-close"]'));
    expect(onOpenChange).not.toHaveBeenLastCalledWith(false);

    render(enabledState, enabledState);
    click(requiredBodyElement('[data-slot="sheet-close"]'));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("reports native disabled conflicts with the exact export", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    act(() =>
      root.render(
        <AlertDialog>
          <AlertDialogTrigger disabled controlState={enabledState}>
            Open
          </AlertDialogTrigger>
        </AlertDialog>,
      ),
    );

    expect(error).toHaveBeenCalledWith(
      "AlertDialogTrigger received contradictory disabled and controlState values",
    );
    error.mockRestore();
  });
});

function click(element: Element) {
  act(() => element.dispatchEvent(new MouseEvent("click", { bubbles: true })));
}

function requiredElement(parent: ParentNode, selector: string): HTMLElement {
  const element = parent.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

function requiredBodyElement(selector: string): HTMLElement {
  return requiredElement(document.body, selector);
}

function requiredBodyElements(selector: string): HTMLElement[] {
  const elements = Array.from(document.body.querySelectorAll<HTMLElement>(selector));
  if (elements.length === 0) throw new Error(`Missing elements: ${selector}`);
  return elements;
}
