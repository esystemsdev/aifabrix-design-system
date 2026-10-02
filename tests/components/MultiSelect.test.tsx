import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MultiSelect } from "../../src/components/multi-select";
import type { FieldState } from "../../src/control-state";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub);
Element.prototype.scrollIntoView = vi.fn();

const options = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "Needs review" },
  { value: "approved", label: "Approved" },
];

describe("MultiSelect legacy contract", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    document
      .querySelectorAll("[data-radix-popper-content-wrapper]")
      .forEach((element) => element.remove());
  });

  it("preserves the no-state trigger, badges, and option event contract", async () => {
    const onChange = vi.fn();
    renderMultiSelect(root, onChange);
    const trigger = getTrigger(container);

    expect({
      ariaExpanded: trigger.getAttribute("aria-expanded"),
      className: trigger.className,
      controlState: trigger.getAttribute("data-control-state"),
      role: trigger.getAttribute("role"),
      tabIndex: trigger.tabIndex,
      tag: trigger.tagName.toLowerCase(),
    }).toEqual({
      ariaExpanded: "false",
      className: expect.stringContaining("min-h-10"),
      controlState: null,
      role: "combobox",
      tabIndex: 0,
      tag: "div",
    });
    const remove = getRemove(container, "Draft");
    expect(remove.tabIndex).toBe(0);
    expect(remove.className).toBe(
      "ml-0.5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
    );
    const removeIconClass = remove.querySelector("svg")?.getAttribute("class");
    expect(removeIconClass).toContain("text-secondary-foreground/70");
    expect(removeIconClass).not.toContain("text-muted-foreground");

    await click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(requiredText("Draft").querySelector("svg")?.getAttribute("class")).toContain(
      "text-primary-foreground",
    );
    await click(requiredText("Approved"));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(["draft", "approved"]);
  });

  it("emits badge removal exactly once for pointer and keyboard", async () => {
    const onChange = vi.fn();
    renderMultiSelect(root, onChange);
    const remove = getRemove(container, "Draft");

    await click(remove);
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenLastCalledWith([]);

    onChange.mockClear();
    keyDown(remove, "Enter");
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it.each(["Enter", " ", "ArrowDown"])("opens the option list with %j on the trigger", (key) => {
    renderMultiSelect(root, vi.fn());
    const trigger = getTrigger(container);

    keyDown(trigger, key);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(requiredText("Approved")).toBeTruthy();
  });

  it("does not open from a badge remove key", () => {
    renderMultiSelect(root, vi.fn());

    keyDown(getRemove(container, "Draft"), "Enter");

    expect(getTrigger(container).getAttribute("aria-expanded")).toBe("false");
  });

  it("does not open from the keyboard when controlState is disabled", () => {
    renderMultiSelect(root, vi.fn(), {
      family: "field",
      visibility: "visible",
      interaction: "disabled",
      activity: "idle",
      validation: "valid",
    });
    const trigger = getTrigger(container);

    keyDown(trigger, "Enter");
    keyDown(trigger, "ArrowDown");

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.querySelector("[cmdk-item]")).toBeNull();
  });
});

function renderMultiSelect(
  root: Root,
  onChange: (values: string[]) => void,
  controlState?: FieldState,
): void {
  act(() =>
    root.render(
      <MultiSelect
        options={options}
        selected={["draft"]}
        onChange={onChange}
        placeholder="Select statuses"
        controlState={controlState}
      />,
    ),
  );
}

function getTrigger(container: HTMLElement): HTMLDivElement {
  return requiredElement<HTMLDivElement>(container, '[role="combobox"]');
}

function getRemove(container: HTMLElement, label: string): HTMLSpanElement {
  return requiredElement<HTMLSpanElement>(
    container,
    `[role="button"][aria-label="Remove ${label}"]`,
  );
}

function requiredText(text: string): HTMLElement {
  const element = Array.from(document.querySelectorAll<HTMLElement>("[cmdk-item]")).find(
    (candidate) => candidate.textContent?.includes(text),
  );
  if (!element) throw new Error(`Missing cmdk item: ${text}`);
  return element;
}

function requiredElement<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

async function click(element: Element): Promise<void> {
  await act(async () => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
  });
}

function keyDown(element: Element, key: string): void {
  act(() => element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true })));
}
