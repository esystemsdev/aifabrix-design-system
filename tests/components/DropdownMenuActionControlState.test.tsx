import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../src/components/dropdown-menu";
import { Button } from "../../src/components/button";
import { stateReason, type ActionState } from "../../src/control-state";
import { StateReasonText } from "../../src/control-state-react";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as typeof globalThis & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver =
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
if (!globalThis.PointerEvent) {
  globalThis.PointerEvent = MouseEvent as typeof PointerEvent;
}
if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => undefined;
  HTMLElement.prototype.releasePointerCapture = () => undefined;
}

const disabledReason = stateReason(
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
  reason: disabledReason,
};
const busyState: ActionState = {
  family: "action",
  visibility: "visible",
  interaction: "enabled",
  activity: "busy",
  busyLabel: "Loading menu actions",
};

describe("DropdownMenu controlState", () => {
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
      .querySelectorAll('[data-slot="dropdown-menu-content"]')
      .forEach((element) => element.remove());
    container.remove();
  });

  it("freezes the no-state trigger, item, portal, ARIA, class, and event contract", () => {
    const onSelect = vi.fn();
    act(() =>
      root.render(
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Review actions">Actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onSelect}>Approve</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      ),
    );
    const trigger = requiredTrigger(container);

    expect({
      ariaExpanded: trigger.getAttribute("aria-expanded"),
      ariaHasPopup: trigger.getAttribute("aria-haspopup"),
      className: trigger.className,
      dataControlState: trigger.getAttribute("data-control-state"),
      dataState: trigger.getAttribute("data-state"),
      disabled: trigger.disabled,
      role: trigger.getAttribute("role"),
      slot: trigger.getAttribute("data-slot"),
      tag: trigger.tagName.toLowerCase(),
      type: trigger.getAttribute("type"),
    }).toEqual({
      ariaExpanded: "false",
      ariaHasPopup: "menu",
      className: "",
      dataControlState: null,
      dataState: "closed",
      disabled: false,
      role: null,
      slot: "dropdown-menu-trigger",
      tag: "button",
      type: "button",
    });

    openMenu(trigger);
    const content = requiredContent();
    const item = requiredItem(content);
    expect({
      contentRole: content.getAttribute("role"),
      contentSlot: content.getAttribute("data-slot"),
      itemClassName: item.className,
      itemControlState: item.getAttribute("data-control-state"),
      itemRole: item.getAttribute("role"),
      itemSlot: item.getAttribute("data-slot"),
      itemTag: item.tagName.toLowerCase(),
      triggerExpanded: trigger.getAttribute("aria-expanded"),
    }).toEqual({
      contentRole: "menu",
      contentSlot: "dropdown-menu-content",
      itemClassName: expect.stringContaining("cursor-pointer"),
      itemControlState: null,
      itemRole: "menuitem",
      itemSlot: "dropdown-menu-item",
      itemTag: "div",
      triggerExpanded: "true",
    });

    act(() => item.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("preserves native no-state disabled transition behavior while open", () => {
    const render = (disabled: boolean) =>
      act(() =>
        root.render(
          <DropdownMenu defaultOpen>
            <DropdownMenuTrigger disabled={disabled}>Actions</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Approve</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>,
        ),
      );

    render(false);
    expect(requiredContent()).not.toBeNull();
    render(true);

    expect(document.body.querySelector('[data-slot="dropdown-menu-content"]')).not.toBeNull();
    expect(requiredTrigger(container).disabled).toBe(true);
    expect(document.activeElement?.isConnected).toBe(true);
  });

  it("closes an uncontrolled open menu when trigger controlState becomes restricted", () => {
    const onOpenChange = vi.fn();
    const render = (controlState: ActionState) =>
      act(() =>
        root.render(
          <DropdownMenu defaultOpen onOpenChange={onOpenChange}>
            <DropdownMenuTrigger
              controlState={controlState}
              stateReasonId={
                controlState.visibility === "visible" && controlState.interaction === "disabled"
                  ? "menu-reason"
                  : undefined
              }
            >
              Actions
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Approve</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>,
        ),
      );

    render(enabledState);
    expect(requiredContent()).not.toBeNull();
    onOpenChange.mockClear();
    render(disabledState);

    expect(document.body.querySelector('[data-slot="dropdown-menu-content"]')).toBeNull();
    expect(requiredTrigger(container).disabled).toBe(true);
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.activeElement?.isConnected).toBe(true);
  });

  it("keeps controlled open state caller-owned while requesting close once", () => {
    const onOpenChange = vi.fn();
    const render = (open: boolean, controlState: ActionState) =>
      act(() =>
        root.render(
          <DropdownMenu open={open} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger controlState={controlState} stateReasonId="menu-reason">
              Actions
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Approve</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>,
        ),
      );

    render(true, enabledState);
    onOpenChange.mockClear();
    render(true, disabledState);
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(requiredContent()).not.toBeNull();

    render(false, disabledState);
    expect(document.body.querySelector('[data-slot="dropdown-menu-content"]')).toBeNull();
  });

  it("renders hidden trigger without trigger, portal, reason, or detached focus residue", () => {
    act(() =>
      root.render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger controlState={{ family: "action", visibility: "hidden" }}>
            Actions
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Approve</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      ),
    );

    expect(container.querySelector('[data-slot="dropdown-menu-trigger"]')).toBeNull();
    expect(document.body.querySelector('[data-slot="dropdown-menu-content"]')).toBeNull();
    expect(container.textContent).toBe("");
    expect(document.activeElement?.isConnected).toBe(true);
  });

  it("composes asChild trigger disabled and busy output without changing Button behavior", () => {
    const render = (controlState: ActionState) =>
      act(() =>
        root.render(
          <>
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                controlState={controlState}
                stateReasonId={
                  controlState.visibility === "visible" && controlState.interaction === "disabled"
                    ? "menu-reason"
                    : undefined
                }
              >
                <Button variant="outline">Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Approve</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <StateReasonText id="menu-reason" reason={disabledReason} />
          </>,
        ),
      );

    render(disabledState);
    let trigger = requiredTrigger(container);
    expect(trigger.disabled).toBe(true);
    expect(trigger.getAttribute("data-control-state")).toBe("disabled");
    expect(trigger.getAttribute("aria-describedby")).toBe("menu-reason");
    expect(trigger.className).toContain("border");
    expect(trigger.querySelector('[aria-hidden="true"]')).toBeNull();

    render(busyState);
    trigger = requiredTrigger(container);
    expect(trigger.disabled).toBe(true);
    expect(trigger.getAttribute("aria-busy")).toBe("true");
    expect(trigger.getAttribute("data-control-state")).toBe("busy");
    expect(trigger.textContent).toBe("Actions");
    expect(container.textContent).toContain("Loading menu actions");
    expect(trigger.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("suppresses restricted item click and select while preserving content", () => {
    const onClick = vi.fn();
    const onSelect = vi.fn();
    const render = (controlState: ActionState) =>
      act(() =>
        root.render(
          <DropdownMenu defaultOpen>
            <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                controlState={controlState}
                stateReasonId={
                  controlState.visibility === "visible" && controlState.interaction === "disabled"
                    ? "menu-reason"
                    : undefined
                }
                onClick={onClick}
                onSelect={onSelect}
              >
                Approve
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>,
        ),
      );

    render(disabledState);
    let item = requiredItem(requiredContent());
    expect(item.getAttribute("aria-disabled")).toBe("true");
    expect(item.getAttribute("aria-describedby")).toBe("menu-reason");
    act(() => item.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(onClick).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();

    render(busyState);
    item = requiredItem(requiredContent());
    expect(item.getAttribute("aria-busy")).toBe("true");
    expect(item.textContent).toBe("ApproveLoading menu actions");
    act(() => item.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(onClick).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("reports native conflicts and missing reason association per export", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    act(() =>
      root.render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger disabled controlState={enabledState}>
            Actions
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem controlState={disabledState}>Approve</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      ),
    );

    expect(error).toHaveBeenCalledWith(
      "DropdownMenuTrigger received contradictory disabled and controlState values",
    );
    expect(error).toHaveBeenCalledWith("Restricted controlState requires stateReasonId");
    error.mockRestore();
  });

  it("keeps a single Slot child when DropdownMenuItem is asChild", () => {
    act(() =>
      root.render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <a href="/connected-systems/orders">
                <span>View</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      ),
    );

    const link = requiredContent().querySelector("a");
    expect(link?.getAttribute("href")).toBe("/connected-systems/orders");
    expect(link?.textContent).toContain("View");
  });
});

function requiredTrigger(container: HTMLElement): HTMLButtonElement {
  const trigger = container.querySelector<HTMLButtonElement>('[data-slot="dropdown-menu-trigger"]');
  if (!trigger) throw new Error("Expected DropdownMenuTrigger");
  return trigger;
}

function requiredContent(): HTMLElement {
  const content = document.body.querySelector<HTMLElement>('[data-slot="dropdown-menu-content"]');
  if (!content) throw new Error("Expected DropdownMenuContent");
  return content;
}

function requiredItem(content: HTMLElement): HTMLElement {
  const item = content.querySelector<HTMLElement>('[data-slot="dropdown-menu-item"]');
  if (!item) throw new Error("Expected DropdownMenuItem");
  return item;
}

function openMenu(trigger: HTMLElement): void {
  act(() =>
    trigger.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        ctrlKey: false,
      }),
    ),
  );
}
