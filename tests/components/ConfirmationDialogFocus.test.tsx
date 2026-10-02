import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ConfirmationDialog } from "../../src/components/confirmation-dialog";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

function ControlledConfirmation() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Delete
      </button>
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete item?"
        description="This cannot be undone."
        onConfirm={() => undefined}
      />
    </>
  );
}

describe("ConfirmationDialog focus restore", () => {
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

  it("returns focus to the opener when a controlled dialog closes with Escape", async () => {
    act(() => root.render(<ControlledConfirmation />));
    const opener = requiredElement<HTMLButtonElement>(container, "button");
    opener.focus();

    act(() => opener.click());
    await flushTimers();
    expect(document.body.querySelector('[data-slot="alert-dialog-content"]')).not.toBeNull();
    expect(document.activeElement).not.toBe(opener);

    act(() => {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    await flushTimers();

    expect(document.body.querySelector('[data-slot="alert-dialog-content"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("returns focus to the opener when Cancel closes the dialog", async () => {
    act(() => root.render(<ControlledConfirmation />));
    const opener = requiredElement<HTMLButtonElement>(container, "button");
    opener.focus();

    act(() => opener.click());
    await flushTimers();
    const cancel = Array.from(document.body.querySelectorAll("button")).find(
      (button) => button.textContent === "Cancel",
    );
    if (!cancel) throw new Error("Missing Cancel button");

    act(() => cancel.click());
    await flushTimers();

    expect(document.activeElement).toBe(opener);
  });
});

async function flushTimers(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function requiredElement<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}
