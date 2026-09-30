import { cn } from '../utils/cn';
import type { SearchableSelectSize } from './searchable-select-types';

/** Show in-popover search when option count exceeds this, unless `searchable` overrides. */
export const SEARCHABLE_SELECT_SEARCH_THRESHOLD = 8;

export function searchableSelectPopoverClass(size: SearchableSelectSize = 'md'): string {
  const preferredMin = size === 'sm' ? '260px' : '280px';
  const maxWidth = size === 'sm' ? '360px' : '420px';
  return cn(
    'p-0',
    'min-w-[var(--radix-popover-trigger-width)]',
    `w-[max(var(--radix-popover-trigger-width),${preferredMin})]`,
    `max-w-[min(${maxWidth},calc(100vw-1rem))]`,
  );
}

export function searchableSelectListClass(): string {
  return cn(
    'max-h-[300px] overflow-y-auto overscroll-contain',
    '[scrollbar-width:thin]',
    '[&::-webkit-scrollbar]:w-1.5',
    '[&::-webkit-scrollbar-track]:bg-transparent',
    '[&::-webkit-scrollbar-thumb]:rounded-full',
    '[&::-webkit-scrollbar-thumb]:bg-muted-foreground/35',
  );
}

export function shouldShowSearchableSelectSearch(
  optionCount: number,
  searchable?: boolean,
): boolean {
  if (searchable === true) {
    return true;
  }
  if (searchable === false) {
    return false;
  }
  return optionCount > SEARCHABLE_SELECT_SEARCH_THRESHOLD;
}

export function commandItemFilterValue(option: {
  label: string;
  value: string;
  searchValue?: string;
}): string {
  return option.searchValue ?? `${option.label} ${option.value}`;
}
