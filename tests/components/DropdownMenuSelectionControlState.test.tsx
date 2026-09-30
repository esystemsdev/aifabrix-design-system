import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../src/components/dropdown-menu";
import { stateReason, type ActionState } from "../../src/control-state";

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
  "permission.denied",
  "You cannot change this preference.",
  "permission",
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
  busyLabel: "Saving preference",
};

describe("DropdownMenu selection controlState", () => {
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
        '[data-slot="dropdown-menu-content"], [data-slot="dropdown-menu-sub-content"]',
      )
      .forEach((element) => element.remove());
    container.remove();
  });

  it("freezes no-state checkbox/radio DOM, checked/value, and exact event behavior", () => {
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    act(() =>
      root.render(
        <SelectionMenu
          checked
          radioValue="compact"
          onCheckedChange={onCheckedChange}
          onValueChange={onValueChange}
        />,
      ),
    );
    const content = requiredContent();
    const checkbox = requiredCheckbox(content);
    const compact = requiredRadio(content, "compact");
    const comfortable = requiredRadio(content, "comfortable");

    expect({
      checkboxChecked: checkbox.getAttribute("aria-checked"),
      checkboxControlState: checkbox.getAttribute("data-control-state"),
      checkboxRole: checkbox.getAttribute("role"),
      checkboxSlot: checkbox.getAttribute("data-slot"),
      compactChecked: compact.getAttribute("aria-checked"),
      comfortableChecked: comfortable.getAttribute("aria-checked"),
      radioRole: compact.getAttribute("role"),
      radioSlot: compact.getAttribute("data-slot"),
    }).toEqual({
      checkboxChecked: "true",
      checkboxControlState: null,
      checkboxRole: "menuitemcheckbox",
      checkboxSlot: "dropdown-menu-checkbox-item",
      compactChecked: "true",
      comfortableChecked: "false",
      radioRole: "menuitemradio",
      radioSlot: "dropdown-menu-radio-item",
    });

    click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    click(comfortable);
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("comfortable");
  });

  it.each([
    ["disabled", disabledState],
    ["busy", busyState],
  ] as const)("keeps checked/radio values while %s suppresses mutation", (_, state) => {
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    act(() =>
      root.render(
        <SelectionMenu
          checked
          radioValue="compact"
          controlState={state}
          onCheckedChange={onCheckedChange}
          onValueChange={onValueChange}
        />,
      ),
    );
    const content = requiredContent();
    const checkbox = requiredCheckbox(content);
    const compact = requiredRadio(content, "compact");
    const comfortable = requiredRadio(content, "comfortable");

    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    expect(compact.getAttribute("aria-checked")).toBe("true");
    expect(comfortable.getAttribute("aria-checked")).toBe("false");
    expect(checkbox.getAttribute("aria-disabled")).toBe("true");
    expect(comfortable.getAttribute("aria-disabled")).toBe("true");
    if (state === busyState) {
      expect(checkbox.getAttribute("aria-busy")).toBe("true");
      expect(checkbox.textContent).toContain("Saving preference");
    }

    click(checkbox);
    click(comfortable);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("hides selection items without changing caller-owned values or siblings", () => {
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    act(() =>
      root.render(
        <SelectionMenu
          checked
          radioValue="compact"
          controlState={{ family: "action", visibility: "hidden" }}
          onCheckedChange={onCheckedChange}
          onValueChange={onValueChange}
        />,
      ),
    );
    const content = requiredContent();

    expect(content.querySelector('[data-slot="dropdown-menu-checkbox-item"]')).toBeNull();
    expect(content.querySelectorAll('[data-slot="dropdown-menu-radio-item"]')).toHaveLength(0);
    expect(content.querySelector('[data-slot="dropdown-menu-item"]')?.textContent).toBe(
      "Unrestricted sibling",
    );
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(document.activeElement?.isConnected).toBe(true);
  });

  it("restricts a submenu trigger without weakening enabled siblings", () => {
    act(() =>
      root.render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger controlState={disabledState} stateReasonId="submenu-reason">
                More
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Archive</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem>Sibling</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      ),
    );
    const content = requiredContent();
    const subTrigger = requiredSubTrigger(content);
    const sibling = content.querySelector<HTMLElement>('[data-slot="dropdown-menu-item"]');

    expect(subTrigger.getAttribute("aria-disabled")).toBe("true");
    expect(subTrigger.getAttribute("aria-describedby")).toBe("submenu-reason");
    expect(sibling?.getAttribute("aria-disabled")).toBeNull();
    expect(sibling?.textContent).toBe("Sibling");
  });

  it("reports selection-item native conflicts and missing reason association", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    act(() =>
      root.render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked disabled controlState={enabledState}>
              Notifications
            </DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup value="compact">
              <DropdownMenuRadioItem value="compact" controlState={disabledState}>
                Compact
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>,
      ),
    );

    expect(error).toHaveBeenCalledWith(
      "DropdownMenuCheckboxItem received contradictory disabled and controlState values",
    );
    expect(error).toHaveBeenCalledWith("Restricted controlState requires stateReasonId");
    error.mockRestore();
  });
});

function SelectionMenu({
  checked,
  radioValue,
  controlState,
  onCheckedChange,
  onValueChange,
}: {
  checked: boolean;
  radioValue: string;
  controlState?: ActionState;
  onCheckedChange: (checked: boolean) => void;
  onValueChange: (value: string) => void;
}) {
  const reasonId =
    controlState?.visibility === "visible" && controlState.interaction === "disabled"
      ? "selection-reason"
      : undefined;
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Preferences</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem
          checked={checked}
          controlState={controlState}
          stateReasonId={reasonId}
          onCheckedChange={onCheckedChange}
          onSelect={(event) => event.preventDefault()}
        >
          Notifications
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value={radioValue} onValueChange={onValueChange}>
          <DropdownMenuRadioItem
            value="compact"
            controlState={controlState}
            stateReasonId={reasonId}
            onSelect={(event) => event.preventDefault()}
          >
            Compact
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="comfortable"
            controlState={controlState}
            stateReasonId={reasonId}
            onSelect={(event) => event.preventDefault()}
          >
            Comfortable
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuItem>Unrestricted sibling</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function requiredContent(): HTMLElement {
  const content = document.body.querySelector<HTMLElement>('[data-slot="dropdown-menu-content"]');
  if (!content) throw new Error("Expected DropdownMenuContent");
  return content;
}

function requiredCheckbox(content: HTMLElement): HTMLElement {
  const checkbox = content.querySelector<HTMLElement>('[data-slot="dropdown-menu-checkbox-item"]');
  if (!checkbox) throw new Error("Expected DropdownMenuCheckboxItem");
  return checkbox;
}

function requiredRadio(content: HTMLElement, value: string): HTMLElement {
  const radio = [...content.querySelectorAll<HTMLElement>('[role="menuitemradio"]')].find((item) =>
    item.textContent?.includes(value === "compact" ? "Compact" : "Comfortable"),
  );
  if (!radio) throw new Error(`Expected radio item ${value}`);
  return radio;
}

function requiredSubTrigger(content: HTMLElement): HTMLElement {
  const trigger = content.querySelector<HTMLElement>('[data-slot="dropdown-menu-sub-trigger"]');
  if (!trigger) throw new Error("Expected DropdownMenuSubTrigger");
  return trigger;
}

function click(element: HTMLElement): void {
  act(() => element.dispatchEvent(new MouseEvent("click", { bubbles: true })));
}
