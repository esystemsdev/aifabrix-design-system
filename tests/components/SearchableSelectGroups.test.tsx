import React, { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import {
  SearchableSelect,
  type SearchableSelectGroup,
} from '../../src/components/searchable-select';
import {
  flattenSearchableSelectGroups,
  resolveSearchableSelectGroups,
} from '../../src/components/searchable-select-layout';

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
Element.prototype.scrollIntoView = vi.fn();

const GROUPS: SearchableSelectGroup[] = [
  {
    label: 'Applications',
    options: [
      { value: 'app:crm', label: 'CRM Portal', icon: <svg data-testid="icon-app" /> },
      { value: 'app:erp', label: 'ERP Suite' },
    ],
  },
  {
    label: 'Integrations',
    options: [
      { value: 'source:hubspot', label: 'HubSpot', icon: <svg data-testid="icon-source" /> },
      { value: 'source:crm-sync', label: 'CRM Sync' },
    ],
  },
];

function trigger(container: HTMLElement) {
  return container.querySelector('[data-testid="searchable-select-trigger"]') as HTMLButtonElement;
}

async function openSelect(container: HTMLElement) {
  await act(async () => {
    trigger(container).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
  });
}

async function typeSearch(text: string) {
  const input = document.querySelector('[data-testid="searchable-select-search"]') as HTMLInputElement;
  const setNativeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  await act(async () => {
    input.focus();
    setNativeValue?.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await Promise.resolve();
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function visibleGroupHeadings(): string[] {
  return Array.from(document.querySelectorAll('[cmdk-group]'))
    .filter((group) => !(group as HTMLElement).hidden)
    .map((group) => group.querySelector('[cmdk-group-heading]')?.textContent ?? '');
}

describe('searchable-select group helpers', () => {
  it('uses groups when non-empty and one unlabeled group for flat options', () => {
    const flat = [{ value: 'a', label: 'A' }];
    expect(resolveSearchableSelectGroups(flat, GROUPS)).toBe(GROUPS);
    expect(resolveSearchableSelectGroups(flat, [])).toEqual([{ label: '', options: flat }]);
    expect(resolveSearchableSelectGroups(undefined, undefined)).toEqual([{ label: '', options: [] }]);
    expect(flattenSearchableSelectGroups(GROUPS).map((option) => option.value)).toEqual([
      'app:crm',
      'app:erp',
      'source:hubspot',
      'source:crm-sync',
    ]);
  });
});

describe('SearchableSelect groups, icons and renderValue', () => {
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

  it('renders group headings with their options and option icons', async () => {
    await act(async () => {
      root.render(<SearchableSelect groups={GROUPS} value="" onValueChange={() => undefined} />);
    });
    await openSelect(container);
    expect(visibleGroupHeadings()).toEqual(['Applications', 'Integrations']);
    const crm = document.querySelector('[data-testid="searchable-select-option-app:crm"]');
    expect(crm?.closest('[cmdk-group]')?.textContent).toContain('Applications');
    expect(crm?.querySelector('[data-testid="icon-app"]')).toBeTruthy();
    expect(
      document.querySelector('[data-testid="searchable-select-option-app:erp"] [data-testid="searchable-select-option-icon"]'),
    ).toBeNull();
  });

  it('[EDGE] search matches options in several groups and hides groups without a match', async () => {
    await act(async () => {
      root.render(<SearchableSelect groups={GROUPS} value="" onValueChange={() => undefined} searchable />);
    });
    await openSelect(container);
    await typeSearch('crm');
    expect(visibleGroupHeadings()).toEqual(['Applications', 'Integrations']);
    await typeSearch('hubspot');
    expect(visibleGroupHeadings()).toEqual(['Integrations']);
  });

  it('counts options across groups for the automatic search threshold', async () => {
    const many: SearchableSelectGroup[] = [
      { label: 'One', options: Array.from({ length: 5 }, (_, i) => ({ value: `a${i}`, label: `A ${i}` })) },
      { label: 'Two', options: Array.from({ length: 5 }, (_, i) => ({ value: `b${i}`, label: `B ${i}` })) },
    ];
    await act(async () => {
      root.render(<SearchableSelect groups={many} value="" onValueChange={() => undefined} />);
    });
    await openSelect(container);
    expect(document.querySelector('[data-testid="searchable-select-search"]')).toBeTruthy();
  });

  it('selects a grouped option and shows its icon and label in the trigger', async () => {
    let value = '';
    const render = () =>
      root.render(
        <SearchableSelect
          groups={GROUPS}
          value={value}
          onValueChange={(next) => {
            value = next;
          }}
        />,
      );
    await act(async () => render());
    await openSelect(container);
    const option = document.querySelector('[data-testid="searchable-select-option-source:hubspot"]') as HTMLElement;
    await act(async () => {
      option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
    });
    expect(value).toBe('source:hubspot');
    await act(async () => render());
    expect(trigger(container).textContent).toContain('HubSpot');
    expect(trigger(container).querySelector('[data-testid="icon-source"]')).toBeTruthy();
  });

  it('highlights the selected option when the list opens', async () => {
    await act(async () => {
      root.render(<SearchableSelect groups={GROUPS} value="source:hubspot" onValueChange={() => undefined} />);
    });
    await openSelect(container);
    const highlighted = Array.from(document.querySelectorAll('[cmdk-item][data-selected="true"]'));
    expect(highlighted.map((item) => item.getAttribute('data-testid'))).toEqual([
      'searchable-select-option-source:hubspot',
    ]);
  });

  it('renderValue controls the trigger content for a selected option', async () => {
    await act(async () => {
      root.render(
        <SearchableSelect
          groups={GROUPS}
          value="app:erp"
          onValueChange={() => undefined}
          renderValue={(option) => (option ? `Selected: ${option.label}` : null)}
        />,
      );
    });
    expect(trigger(container).textContent).toContain('Selected: ERP Suite');
  });

  it('[EDGE] renderValue receives null without a selection and null falls back to the placeholder', async () => {
    const renderValue = vi.fn((option: unknown) => (option ? 'never' : null));
    await act(async () => {
      root.render(
        <SearchableSelect
          groups={GROUPS}
          value=""
          onValueChange={() => undefined}
          placeholder="Application / Source"
          renderValue={renderValue}
        />,
      );
    });
    expect(renderValue).toHaveBeenCalledWith(null);
    expect(trigger(container).textContent).toContain('Application / Source');
  });

  it('[EDGE] a custom value is shown even when the value is not in the options', async () => {
    await act(async () => {
      root.render(
        <SearchableSelect
          groups={GROUPS}
          value="app:removed"
          onValueChange={() => undefined}
          placeholder="Application / Source"
          renderValue={(option) => (option ? null : 'Removed application')}
        />,
      );
    });
    expect(trigger(container).textContent).toContain('Removed application');
  });

  it('[EDGE] a disabled option cannot be selected with the keyboard', async () => {
    const onValueChange = vi.fn();
    await act(async () => {
      root.render(
        <SearchableSelect
          groups={[{ label: 'Only', options: [{ value: 'blocked', label: 'Blocked', disabled: true }] }]}
          value=""
          onValueChange={onValueChange}
          searchable
        />,
      );
    });
    await openSelect(container);
    const input = document.querySelector('[data-testid="searchable-select-search"]') as HTMLInputElement;
    await act(async () => {
      input.focus();
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await Promise.resolve();
    });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('[EDGE] keyboard Enter selects the first enabled option, skipping a disabled one', async () => {
    const onValueChange = vi.fn();
    await act(async () => {
      root.render(
        <SearchableSelect
          groups={[
            {
              label: 'Mixed',
              options: [
                { value: 'blocked', label: 'Blocked', disabled: true },
                { value: 'ok', label: 'Allowed' },
              ],
            },
          ]}
          value=""
          onValueChange={onValueChange}
          searchable
        />,
      );
    });
    await openSelect(container);
    const input = document.querySelector('[data-testid="searchable-select-search"]') as HTMLInputElement;
    await act(async () => {
      input.focus();
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await Promise.resolve();
    });
    expect(onValueChange).toHaveBeenCalledWith('ok');
    expect(onValueChange).not.toHaveBeenCalledWith('blocked');
  });
});
