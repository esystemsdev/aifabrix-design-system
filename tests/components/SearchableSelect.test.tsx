import React, { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import {
  SearchableSelect,
  SEARCHABLE_SELECT_SEARCH_THRESHOLD,
  shouldShowSearchableSelectSearch,
} from '../../src/components/searchable-select';
import {
  commandItemFilterValue,
  searchableSelectListClass,
  searchableSelectPopoverClass,
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

const LONG_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: `role-${index}`,
  label: `AI Fabrix Business Transformation Role ${index}`,
}));

async function openSelect(container: HTMLElement) {
  const trigger = container.querySelector(
    '[data-testid="searchable-select-trigger"]',
  ) as HTMLButtonElement;
  await act(async () => {
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
  });
  return trigger;
}

describe('searchable-select-layout', () => {
  it('uses preferred min width and viewport-capped max', () => {
    const cls = searchableSelectPopoverClass('sm');
    expect(cls).toContain('min-w-[var(--radix-popover-trigger-width)]');
    expect(cls).toContain('260px');
    expect(cls).toContain('360px');
    expect(cls).toContain('calc(100vw-1rem)');
  });

  it('list uses thin scrollbar tokens without custom rails', () => {
    const cls = searchableSelectListClass();
    expect(cls).toContain('max-h-[300px]');
    expect(cls).toContain('[scrollbar-width:thin]');
    expect(cls).not.toContain('scrollbar-button');
  });

  it('auto-shows search above threshold', () => {
    expect(shouldShowSearchableSelectSearch(SEARCHABLE_SELECT_SEARCH_THRESHOLD)).toBe(false);
    expect(shouldShowSearchableSelectSearch(SEARCHABLE_SELECT_SEARCH_THRESHOLD + 1)).toBe(true);
    expect(shouldShowSearchableSelectSearch(2, true)).toBe(true);
    expect(shouldShowSearchableSelectSearch(20, false)).toBe(false);
  });

  it('filters on label + value and optional searchValue (case-insensitive source string)', () => {
    expect(
      commandItemFilterValue({
        label: 'AI Fabrix Operator',
        value: 'ai-trust-operator',
      }),
    ).toBe('AI Fabrix Operator ai-trust-operator');
    expect(
      commandItemFilterValue({
        label: 'Display',
        value: 'key',
        searchValue: 'Custom Search Token',
      }),
    ).toBe('Custom Search Token');
  });
});

describe('SearchableSelect', () => {
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

  it('opens with truncated option labels and check for selected', async () => {
    await act(async () => {
      root.render(
        <SearchableSelect
          options={LONG_OPTIONS}
          value="role-1"
          onValueChange={() => undefined}
          placeholder="All roles"
          searchPlaceholder="Search roles…"
          size="sm"
        />,
      );
    });
    await openSelect(container);
    const content = document.querySelector('[data-testid="searchable-select-content"]');
    expect(content).toBeTruthy();
    expect(
      content?.querySelector('input[placeholder="Search roles…"]'),
    ).toBeTruthy();
    const selected = document.querySelector('[data-testid="searchable-select-option-role-1"]');
    expect(selected?.querySelector('svg')).toBeTruthy();
    const label = selected?.querySelector('.truncate');
    expect(label?.className).toContain('truncate');
    expect(label?.className).not.toContain('break-words');
  });

  it('[EDGE] shows loading state', async () => {
    await act(async () => {
      root.render(
        <SearchableSelect
          options={[]}
          value=""
          onValueChange={() => undefined}
          loading
          loadingText="Loading roles…"
        />,
      );
    });
    await openSelect(container);
    expect(document.querySelector('[data-testid="searchable-select-loading"]')?.textContent).toContain(
      'Loading roles',
    );
  });

  it('[EDGE] shows no-options state', async () => {
    await act(async () => {
      root.render(
        <SearchableSelect
          options={[]}
          value=""
          onValueChange={() => undefined}
          noOptionsText="No roles available"
        />,
      );
    });
    await openSelect(container);
    expect(
      document.querySelector('[data-testid="searchable-select-no-options"]')?.textContent ?? '',
    ).toContain('No roles available');
  });

  it('hides search for short lists unless forced', async () => {
    await act(async () => {
      root.render(
        <SearchableSelect
          options={LONG_OPTIONS.slice(0, 3)}
          value=""
          onValueChange={() => undefined}
          searchPlaceholder="Search roles…"
        />,
      );
    });
    await openSelect(container);
    const content = document.querySelector('[data-testid="searchable-select-content"]');
    expect(content?.querySelector('input')).toBeNull();
  });

  it('clears selection when allowClear and selected option is re-chosen', async () => {
    let value = 'role-0';
    await act(async () => {
      root.render(
        <SearchableSelect
          options={LONG_OPTIONS.slice(0, 3)}
          value={value}
          onValueChange={(next) => {
            value = next;
          }}
          allowClear
          searchable
        />,
      );
    });
    await openSelect(container);
    const option = document.querySelector(
      '[data-testid="searchable-select-option-role-0"]',
    ) as HTMLElement;
    await act(async () => {
      option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
    });
    expect(value).toBe('');
  });

  it('[EDGE] shows placeholder when value is not in options', async () => {
    await act(async () => {
      root.render(
        <SearchableSelect
          options={LONG_OPTIONS.slice(0, 3)}
          value="missing-role"
          onValueChange={() => undefined}
          placeholder="All roles"
        />,
      );
    });
    const trigger = container.querySelector(
      '[data-testid="searchable-select-trigger"]',
    ) as HTMLButtonElement;
    expect(trigger.textContent).toContain('All roles');
  });

  it('[EDGE] skips disabled options on select', async () => {
    let value = '';
    await act(async () => {
      root.render(
        <SearchableSelect
          options={[
            { value: 'ok', label: 'Enabled role' },
            { value: 'blocked', label: 'Disabled role', disabled: true },
          ]}
          value={value}
          onValueChange={(next) => {
            value = next;
          }}
          searchable
        />,
      );
    });
    await openSelect(container);
    const blocked = document.querySelector(
      '[data-testid="searchable-select-option-blocked"]',
    ) as HTMLElement;
    await act(async () => {
      blocked.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
    });
    expect(value).toBe('');
  });

  it('shows no-match emptyText when search yields no cmdk hits', async () => {
    await act(async () => {
      root.render(
        <SearchableSelect
          options={LONG_OPTIONS}
          value=""
          onValueChange={() => undefined}
          searchPlaceholder="Search roles…"
          emptyText="No roles match"
          searchable
        />,
      );
    });
    await openSelect(container);
    const input = document.querySelector(
      'input[placeholder="Search roles…"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    const setNativeValue = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set;
    await act(async () => {
      input.focus();
      setNativeValue?.call(input, 'zzz-no-such-role');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await Promise.resolve();
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(document.body.textContent ?? '').toContain('No roles match');
  });

  it('calls onSearchChange and keeps unmatched options for remote search', async () => {
    const onSearchChange = vi.fn();
    await act(async () => {
      root.render(
        <SearchableSelect
          options={LONG_OPTIONS}
          value=""
          onValueChange={() => undefined}
          searchPlaceholder="Search deals…"
          emptyText="No deals match"
          searchable
          onSearchChange={onSearchChange}
        />,
      );
    });
    await openSelect(container);
    const input = document.querySelector(
      '[data-testid="searchable-select-search"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    const setNativeValue = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set;
    await act(async () => {
      input.focus();
      setNativeValue?.call(input, 'zzz-no-such-deal');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await Promise.resolve();
    });
    expect(onSearchChange).toHaveBeenCalledWith('zzz-no-such-deal');
    expect(
      document.querySelector('[data-testid="searchable-select-option-role-0"]'),
    ).toBeTruthy();
  });

  it('[EDGE] viewport-safe popover max width uses 100vw minus padding', async () => {
    await act(async () => {
      root.render(
        <SearchableSelect
          options={LONG_OPTIONS}
          value=""
          onValueChange={() => undefined}
          size="md"
        />,
      );
    });
    await openSelect(container);
    const content = document.querySelector(
      '[data-testid="searchable-select-content"]',
    ) as HTMLElement;
    expect(content.className).toContain('calc(100vw-1rem)');
    expect(content.className).toContain('min-w-[var(--radix-popover-trigger-width)]');
  });
});
