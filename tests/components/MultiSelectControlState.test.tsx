import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MultiSelect } from "../../src/components/multi-select";
import { stateReason, type FieldState } from "../../src/control-state";
import { StateReasonText } from "../../src/control-state-react";

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
const readonlyReason = stateReason(
  "access.denied",
  "You can view these statuses but cannot change them.",
  "permission",
);
const disabledReason = stateReason(
  "workflow.unavailable",
  "Complete the required workflow step first.",
  "workflow",
);
const invalidReason = stateReason(
  "validation.required",
  "Choose at least one status.",
  "validation",
);

describe("MultiSelect controlState", () => {
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
    vi.restoreAllMocks();
  });

  it("renders hidden without trigger, badges, or portal residue", () => {
    renderSelect(root, {
      controlState: { family: "field", visibility: "hidden" },
    });

    expect(container.children).toHaveLength(0);
    expect(getContent()).toBeNull();
  });

  it("keeps readonly values focusable while suppressing open and badge removal", async () => {
    const onChange = vi.fn();
    renderSelect(root, {
      onChange,
      controlState: readonlyState,
      stateReasonId: "multi-select-readonly-reason",
    });
    const trigger = getTrigger(container);
    const remove = getRemove(container, "Draft");

    expect(trigger.textContent).toContain("Draft");
    expect(trigger.getAttribute("aria-readonly")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toBe("multi-select-readonly-reason");
    expect(trigger.tabIndex).toBe(0);
    expect(remove.tabIndex).toBe(-1);
    expect(remove.getAttribute("aria-disabled")).toBe("true");
    expect(remove.className).toContain("cursor-default");
    expect(remove.querySelector("svg")?.getAttribute("class")).toContain(
      "text-secondary-foreground/40",
    );

    trigger.focus();
    await click(trigger);
    keyDown(trigger, "Enter");
    keyDown(trigger, " ");
    keyDown(trigger, "ArrowDown");
    await click(remove);
    keyDown(remove, "Enter");

    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(getContent()).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("maps disabled and busy without weakening selected values", async () => {
    for (const state of [disabledState, busyState]) {
      const onChange = vi.fn();
      renderSelect(root, { onChange, controlState: state, stateReasonId: "state-reason" });
      const trigger = getTrigger(container);
      const remove = getRemove(container, "Draft");

      expect(trigger.textContent).toContain("Draft");
      expect(trigger.getAttribute("aria-disabled")).toBe("true");
      expect(trigger.tabIndex).toBe(-1);
      expect(remove.tabIndex).toBe(-1);
      if (state === busyState) {
        expect(trigger.getAttribute("aria-busy")).toBe("true");
      }
      await click(trigger);
      await click(remove);
      expect(getContent()).toBeNull();
      expect(onChange).not.toHaveBeenCalled();
    }
  });

  it("keeps invalid presentation editable and emits exactly once", async () => {
    const onChange = vi.fn();
    renderSelect(root, {
      onChange,
      controlState: invalidState,
      stateReasonId: "multi-select-validation-reason",
    });
    const trigger = getTrigger(container);
    const remove = getRemove(container, "Draft");

    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toBe("multi-select-validation-reason");
    expect(remove.className).toContain("cursor-pointer");
    expect(remove.querySelector("svg")?.getAttribute("class")?.split(" ")).toContain(
      "text-secondary-foreground",
    );
    await click(trigger);
    await click(requiredItem("Approved"));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(["draft", "approved"]);
  });

  it("closes every restricted transition without auto-reopening", async () => {
    for (const transition of restrictedTransitions) {
      renderSelect(root, { controlState: editableState });
      await click(getTrigger(container));
      expect(getContent()).not.toBeNull();

      renderSelect(root, {
        controlState: transition.state,
        stateReasonId: transition.reasonId,
      });
      await flush();
      expect(getContent(), transition.name).toBeNull();

      renderSelect(root, { controlState: editableState });
      await flush();
      expect(getContent(), transition.name).toBeNull();
      expect(getTrigger(container).getAttribute("aria-expanded")).toBe("false");
    }
  });

  it("reports a missing reason association deterministically", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    renderSelect(root, { controlState: readonlyState });

    expect(error).toHaveBeenCalledWith("Restricted controlState requires stateReasonId");
  });
});

type Overrides = {
  onChange?: (values: string[]) => void;
  controlState?: FieldState;
  stateReasonId?: string;
};

function renderSelect(root: Root, overrides: Overrides): void {
  const reason =
    overrides.controlState?.visibility === "visible"
      ? (overrides.controlState.reason ?? overrides.controlState.validationReason)
      : undefined;
  act(() =>
    root.render(
      <>
        <MultiSelect
          options={options}
          selected={["draft"]}
          onChange={overrides.onChange ?? (() => undefined)}
          controlState={overrides.controlState}
          stateReasonId={overrides.stateReasonId}
        />
        {reason && overrides.stateReasonId ? (
          <StateReasonText id={overrides.stateReasonId} reason={reason} />
        ) : null}
      </>,
    ),
  );
}

const editableState: FieldState = {
  family: "field",
  visibility: "visible",
  interaction: "editable",
  activity: "idle",
  validation: "valid",
};
const readonlyState: FieldState = {
  family: "field",
  visibility: "visible",
  interaction: "readonly",
  activity: "idle",
  validation: "valid",
  reason: readonlyReason,
};
const disabledState: FieldState = {
  family: "field",
  visibility: "visible",
  interaction: "disabled",
  activity: "idle",
  validation: "valid",
  reason: disabledReason,
};
const busyState: FieldState = {
  family: "field",
  visibility: "visible",
  interaction: "editable",
  activity: "busy",
  validation: "valid",
};
const invalidState: FieldState = {
  family: "field",
  visibility: "visible",
  interaction: "editable",
  activity: "idle",
  validation: "invalid",
  validationReason: invalidReason,
};
const restrictedTransitions = [
  { name: "readonly", state: readonlyState, reasonId: "readonly-reason" },
  { name: "disabled", state: disabledState, reasonId: "disabled-reason" },
  { name: "busy", state: busyState, reasonId: undefined },
  {
    name: "hidden",
    state: { family: "field", visibility: "hidden" } satisfies FieldState,
    reasonId: undefined,
  },
];

function getTrigger(container: HTMLElement): HTMLDivElement {
  const trigger = container.querySelector<HTMLDivElement>('[role="combobox"]');
  if (!trigger) throw new Error("Missing MultiSelect trigger");
  return trigger;
}

function getRemove(container: HTMLElement, label: string): HTMLSpanElement {
  const remove = container.querySelector<HTMLSpanElement>(
    `[role="button"][aria-label="Remove ${label}"]`,
  );
  if (!remove) throw new Error(`Missing remove control: ${label}`);
  return remove;
}

function getContent(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-slot="popover-content"]');
}

function requiredItem(text: string): HTMLElement {
  const item = Array.from(document.querySelectorAll<HTMLElement>("[cmdk-item]")).find((candidate) =>
    candidate.textContent?.includes(text),
  );
  if (!item) throw new Error(`Missing cmdk item: ${text}`);
  return item;
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

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}
