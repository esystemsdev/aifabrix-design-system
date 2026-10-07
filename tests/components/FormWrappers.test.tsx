import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../../src/components/checkbox';
import { RadioGroup, RadioGroupItem } from '../../src/components/radio-group';
import { Switch } from '../../src/components/switch';
import { Textarea } from '../../src/components/textarea';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('form wrappers', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (node: React.ReactNode) => {
    await act(async () => root.render(node));
  };
  const byRole = (role: string) => container.querySelector(`[role="${role}"]`) as HTMLElement;
  const click = async (element: Element) => {
    await act(async () => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
    });
  };

  it('Checkbox exposes role and name and toggles', async () => {
    const onCheckedChange = vi.fn();
    await render(<Checkbox aria-label="Accept terms" className="extra-checkbox" onCheckedChange={onCheckedChange} />);
    const checkbox = byRole('checkbox');
    expect(checkbox.getAttribute('aria-label')).toBe('Accept terms');
    expect(checkbox.className).toContain('extra-checkbox');
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    await click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
  });

  it('[EDGE] disabled Checkbox does not toggle', async () => {
    const onCheckedChange = vi.fn();
    await render(<Checkbox aria-label="Accept terms" disabled onCheckedChange={onCheckedChange} />);
    await click(byRole('checkbox'));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(byRole('checkbox').getAttribute('aria-checked')).toBe('false');
  });

  it('Switch exposes role and name and toggles', async () => {
    const onCheckedChange = vi.fn();
    await render(<Switch aria-label="Live updates" className="extra-switch" onCheckedChange={onCheckedChange} />);
    const control = byRole('switch');
    expect(control.getAttribute('aria-label')).toBe('Live updates');
    expect(control.className).toContain('extra-switch');
    await click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(control.getAttribute('aria-checked')).toBe('true');
  });

  it('[EDGE] disabled Switch does not toggle', async () => {
    const onCheckedChange = vi.fn();
    await render(<Switch aria-label="Live updates" disabled onCheckedChange={onCheckedChange} />);
    await click(byRole('switch'));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('RadioGroup exposes radiogroup and moves the selection with arrow keys', async () => {
    const onValueChange = vi.fn();
    await render(
      <RadioGroup aria-label="Mode" defaultValue="saas" onValueChange={onValueChange} className="extra-radio">
        <RadioGroupItem value="saas" aria-label="SaaS" />
        <RadioGroupItem value="local" aria-label="Local" />
      </RadioGroup>,
    );
    expect(byRole('radiogroup').className).toContain('extra-radio');
    const radios = container.querySelectorAll('[role="radio"]');
    expect(radios).toHaveLength(2);
    await act(async () => {
      (radios[0] as HTMLElement).focus();
      radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await Promise.resolve();
    });
    expect(document.activeElement).toBe(radios[1]);
    expect(onValueChange).toHaveBeenCalledWith('local');
  });

  it('[EDGE] disabled RadioGroup item cannot be chosen', async () => {
    const onValueChange = vi.fn();
    await render(
      <RadioGroup aria-label="Mode" defaultValue="saas" onValueChange={onValueChange}>
        <RadioGroupItem value="saas" aria-label="SaaS" />
        <RadioGroupItem value="local" aria-label="Local" disabled />
      </RadioGroup>,
    );
    await click(container.querySelectorAll('[role="radio"]')[1]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('Textarea forwards value changes and className', async () => {
    const onChange = vi.fn();
    await render(<Textarea aria-label="Notes" className="extra-textarea" onChange={onChange} />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.dataset.slot).toBe('textarea');
    expect(textarea.className).toContain('extra-textarea');
    const setNativeValue = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    await act(async () => {
      setNativeValue?.call(textarea, 'hello');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(onChange).toHaveBeenCalled();
  });

  it('[EDGE] disabled Textarea is disabled for assistive technology', async () => {
    await render(<Textarea aria-label="Notes" disabled />);
    expect((container.querySelector('textarea') as HTMLTextAreaElement).disabled).toBe(true);
  });

  it('forwards refs to the control element', async () => {
    const checkboxRef = React.createRef<HTMLButtonElement>();
    const switchRef = React.createRef<HTMLButtonElement>();
    const groupRef = React.createRef<HTMLDivElement>();
    const itemRef = React.createRef<HTMLButtonElement>();
    const textareaRef = React.createRef<HTMLTextAreaElement>();
    await render(
      <>
        <Checkbox ref={checkboxRef} aria-label="Accept terms" />
        <Switch ref={switchRef} aria-label="Live updates" />
        <RadioGroup ref={groupRef} aria-label="Mode">
          <RadioGroupItem ref={itemRef} value="saas" aria-label="SaaS" />
        </RadioGroup>
        <Textarea ref={textareaRef} aria-label="Notes" />
      </>,
    );
    expect(checkboxRef.current).toBe(byRole('checkbox'));
    expect(switchRef.current).toBe(byRole('switch'));
    expect(groupRef.current).toBe(byRole('radiogroup'));
    expect(itemRef.current).toBe(byRole('radio'));
    expect(textareaRef.current).toBe(container.querySelector('textarea'));
  });
});
