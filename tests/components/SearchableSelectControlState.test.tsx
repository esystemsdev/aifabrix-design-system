import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchableSelect } from "../../src/components/searchable-select";
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
const deniedReason = stateReason(
  "access.denied",
  "You can view this selection but cannot change it.",
  "permission",
);
const invalidReason = stateReason("validation.required", "Choose a valid status.", "validation");

describe("SearchableSelect controlState", () => {
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
  });

  it("preserves no-state native ARIA and pointer-open behavior", async () => {
    renderSelect(root, {
      describedBy: "native-help",
      ariaInvalid: true,
    });
    const trigger = getTrigger(container);

    expect(trigger.getAttribute("data-control-state")).toBeNull();
    expect(trigger.getAttribute("aria-describedby")).toBe("native-help");
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    await openSelect(trigger);
    expect(getContent()).not.toBeNull();
  });

  it("renders hidden state without trigger or portal residue", () => {
    renderSelect(root, {
      controlState: { family: "field", visibility: "hidden" },
    });

    expect(container.children).toHaveLength(0);
    expect(getContent()).toBeNull();
  });

  it("keeps readonly value focusable while suppressing open interactions", async () => {
    const onValueChange = vi.fn();
    renderSelect(root, {
      value: "review",
      onValueChange,
      controlState: readonlyState,
      stateReasonId: "readonly-reason",
    });
    const trigger = getTrigger(container);

    expect(trigger.textContent).toContain("Needs review");
    expect(trigger.disabled).toBe(false);
    expect(trigger.getAttribute("aria-readonly")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toBe("readonly-reason");
    trigger.focus();
    await openSelect(trigger);
    keyDown(trigger, "Enter");
    keyDown(trigger, " ");
    keyDown(trigger, "ArrowDown");
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(getContent()).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("maps busy presentation without weakening the selected value", async () => {
    renderSelect(root, {
      value: "review",
      controlState: busyState,
    });
    const trigger = getTrigger(container);

    expect(trigger.disabled).toBe(true);
    expect(trigger.getAttribute("aria-busy")).toBe("true");
    expect(trigger.getAttribute("data-control-state")).toBe("busy");
    expect(trigger.textContent).toContain("Needs review");
    await openSelect(trigger);
    expect(getContent()).toBeNull();
  });

  it("keeps portable invalid editable and merges descriptions", async () => {
    const onValueChange = vi.fn();
    renderSelect(root, {
      value: "draft",
      onValueChange,
      describedBy: "native-help",
      ariaInvalid: false,
      controlState: invalidState,
      stateReasonId: "validation-reason",
    });
    const trigger = getTrigger(container);

    expect(trigger.disabled).toBe(false);
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toBe("native-help validation-reason");
    await openSelect(trigger);
    await selectOption("review");
    expect(onValueChange).toHaveBeenCalledOnce();
  });

  it("closes every restricted transition and does not auto-reopen", async () => {
    for (const transition of restrictedTransitions) {
      renderSelect(root, { controlState: editableState });
      await openSelect(getTrigger(container));
      expect(getContent()).not.toBeNull();

      renderSelect(root, {
        controlState: transition.state,
        stateReasonId: transition.reasonId,
      });
      await flush();
      expect(getContent(), transition.name).toBeNull();
      if (transition.state.visibility === "hidden") {
        expect(container.querySelector('[data-testid="searchable-select-trigger"]')).toBeNull();
      } else {
        expect(getTrigger(container).getAttribute("aria-expanded")).toBe("false");
      }

      renderSelect(root, { controlState: editableState });
      await flush();
      expect(getContent(), `${transition.name} auto-reopened`).toBeNull();
    }
  });

  it("keeps native loading independent from portable busy", async () => {
    renderSelect(root, {
      options: [],
      value: "",
      loading: true,
      loadingText: "Loading statuses…",
      controlState: editableState,
    });
    await openSelect(getTrigger(container));

    expect(
      document.querySelector('[data-testid="searchable-select-loading"]')?.textContent,
    ).toContain("Loading statuses");
  });

  it("emits editable value changes exactly once", async () => {
    const onValueChange = vi.fn();
    renderSelect(root, {
      value: "draft",
      onValueChange,
      controlState: editableState,
    });
    await openSelect(getTrigger(container));
    const option = document.querySelector(
      '[data-testid="searchable-select-option-review"]',
    ) as HTMLElement;
    await act(async () => {
      option.click();
      await Promise.resolve();
    });

    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("review");
  });

  it("emits allowClear reselection exactly once", async () => {
    const onValueChange = vi.fn();
    renderSelect(root, {
      value: "draft",
      onValueChange,
      allowClear: true,
      controlState: editableState,
    });
    await openSelect(getTrigger(container));
    await selectOption("draft");

    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("");
  });

  it("reports disabled conflicts and missing reason associations", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    renderSelect(root, {
      disabled: false,
      controlState: disabledState,
    });
    const trigger = getTrigger(container);

    expect(consoleError).toHaveBeenCalledWith(
      "Field received contradictory disabled and controlState values",
    );
    expect(consoleError).toHaveBeenCalledWith("Restricted controlState requires stateReasonId");
    expect(trigger.disabled).toBe(true);
    trigger.click();
    expect(getContent()).toBeNull();
    consoleError.mockRestore();
  });
});

type SelectOverrides = Partial<React.ComponentProps<typeof SearchableSelect>>;

function renderSelect(root: Root, overrides: SelectOverrides = {}): void {
  act(() =>
    root.render(
      <>
        <SearchableSelect
          options={options}
          value="draft"
          onValueChange={() => undefined}
          ariaLabel="Review status"
          {...overrides}
        />
        {overrides.stateReasonId && overrides.controlState ? (
          <StateReasonText
            id={overrides.stateReasonId}
            reason={
              overrides.controlState.visibility === "visible"
                ? (overrides.controlState.reason ??
                  overrides.controlState.validationReason ??
                  deniedReason)
                : deniedReason
            }
          />
        ) : null}
      </>,
    ),
  );
}

async function openSelect(trigger: HTMLButtonElement): Promise<void> {
  await act(async () => {
    trigger.click();
    await Promise.resolve();
  });
}

async function selectOption(value: string): Promise<void> {
  const option = document.querySelector(
    `[data-testid="searchable-select-option-${value}"]`,
  ) as HTMLElement;
  await act(async () => {
    option.click();
    await Promise.resolve();
  });
}

function keyDown(element: HTMLElement, key: string): void {
  act(() =>
    element.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key })),
  );
}

async function flush(): Promise<void> {
  await act(async () => Promise.resolve());
}

function getTrigger(container: ParentNode): HTMLButtonElement {
  const trigger = container.querySelector<HTMLButtonElement>(
    '[data-testid="searchable-select-trigger"]',
  );
  if (!trigger) throw new Error("Missing SearchableSelect trigger");
  return trigger;
}

function getContent(): Element | null {
  return document.querySelector('[data-testid="searchable-select-content"]');
}

const editableState = {
  family: "field",
  visibility: "visible",
  interaction: "editable",
  activity: "idle",
  validation: "valid",
} satisfies FieldState;

const readonlyState = {
  family: "field",
  visibility: "visible",
  interaction: "readonly",
  activity: "idle",
  validation: "valid",
  reason: deniedReason,
} satisfies FieldState;

const disabledState = {
  family: "field",
  visibility: "visible",
  interaction: "disabled",
  activity: "idle",
  validation: "valid",
  reason: deniedReason,
} satisfies FieldState;

const busyState = {
  family: "field",
  visibility: "visible",
  interaction: "editable",
  activity: "busy",
  validation: "valid",
} satisfies FieldState;

const invalidState = {
  family: "field",
  visibility: "visible",
  interaction: "editable",
  activity: "idle",
  validation: "invalid",
  validationReason: invalidReason,
} satisfies FieldState;

const restrictedTransitions: readonly {
  name: string;
  state: FieldState;
  reasonId?: string;
}[] = [
  { name: "readonly", state: readonlyState, reasonId: "readonly-reason" },
  { name: "disabled", state: disabledState, reasonId: "disabled-reason" },
  { name: "busy", state: busyState },
  {
    name: "hidden",
    state: { family: "field", visibility: "hidden" },
  },
];
