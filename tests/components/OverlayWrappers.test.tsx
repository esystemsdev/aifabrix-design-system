import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../src/components/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../../src/components/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '../../src/components/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../src/components/tooltip';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

class ResizeObserverStub {
  observe() {
    return undefined;
  }
  unobserve() {
    return undefined;
  }
  disconnect() {
    return undefined;
  }
}

vi.stubGlobal('ResizeObserver', ResizeObserverStub);

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function click(element: Element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
  });
  await flush();
}

async function pressEscape() {
  await act(async () => {
    (document.activeElement ?? document.body).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    await Promise.resolve();
  });
  await flush();
}

const byRole = (role: string) => document.querySelector(`[role="${role}"]`) as HTMLElement | null;
const triggerButton = (name: string) =>
  Array.from(document.querySelectorAll('button')).find((button) => button.textContent === name) as HTMLButtonElement;

describe('overlay wrappers', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    act(() => root.unmount());
    container.remove();
    await flush();
  });

  const render = async (node: React.ReactNode) => {
    await act(async () => root.render(node));
  };

  it('Popover opens from its trigger, forwards the content ref, and Escape returns focus', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(
      <Popover>
        <PopoverTrigger>Filters</PopoverTrigger>
        <PopoverContent ref={ref} className="extra-popover">
          Filter body
        </PopoverContent>
      </Popover>,
    );
    const trigger = triggerButton('Filters');
    trigger.focus();
    await click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(ref.current?.className).toContain('extra-popover');
    expect(ref.current?.textContent).toBe('Filter body');
    await pressEscape();
    expect(document.body.textContent).not.toContain('Filter body');
    expect(document.activeElement).toBe(trigger);
  });

  it('Tooltip forwards refs to its trigger and content', async () => {
    const triggerRef = React.createRef<HTMLButtonElement>();
    const contentRef = React.createRef<HTMLDivElement>();
    await render(
      <Tooltip open>
        <TooltipTrigger ref={triggerRef}>Info</TooltipTrigger>
        <TooltipContent ref={contentRef} className="extra-tooltip">
          Explains the field
        </TooltipContent>
      </Tooltip>,
    );
    await flush();
    expect(triggerRef.current?.textContent).toBe('Info');
    expect(contentRef.current).toBe(document.querySelector('[data-slot="tooltip-content"]'));
  });

  it('Sheet opens as a named dialog and Escape closes it with focus back on the trigger', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(
      <Sheet>
        <SheetTrigger>Open details</SheetTrigger>
        <SheetContent ref={ref} side="left">
          <SheetTitle>Log details</SheetTitle>
          <SheetDescription>One log line</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    const trigger = triggerButton('Open details');
    trigger.focus();
    await click(trigger);
    const dialog = byRole('dialog');
    expect(dialog).toBeTruthy();
    expect(dialog).toBe(ref.current);
    expect(document.getElementById(dialog?.getAttribute('aria-labelledby') ?? '')?.textContent).toBe('Log details');
    await pressEscape();
    expect(byRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('AlertDialog opens as alertdialog; Cancel closes it with focus back on the trigger', async () => {
    const onAction = vi.fn();
    await render(
      <AlertDialog>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete item?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>Confirm</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const trigger = triggerButton('Delete');
    trigger.focus();
    await click(trigger);
    const dialog = byRole('alertdialog');
    expect(document.getElementById(dialog?.getAttribute('aria-labelledby') ?? '')?.textContent).toBe('Delete item?');
    await click(triggerButton('Cancel'));
    expect(byRole('alertdialog')).toBeNull();
    expect(onAction).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);
  });

  it('[EDGE] AlertDialog closes on Escape without running the action', async () => {
    const onAction = vi.fn();
    await render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Delete item?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          <AlertDialogAction onClick={onAction}>Confirm</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    await flush();
    expect(byRole('alertdialog')).toBeTruthy();
    await pressEscape();
    expect(byRole('alertdialog')).toBeNull();
    expect(onAction).not.toHaveBeenCalled();
  });

  it('[EDGE] a disabled Popover trigger does not open', async () => {
    await render(
      <Popover>
        <PopoverTrigger disabled>Filters</PopoverTrigger>
        <PopoverContent>Filter body</PopoverContent>
      </Popover>,
    );
    await click(triggerButton('Filters'));
    expect(document.body.textContent).not.toContain('Filter body');
  });
});
