import type * as React from 'react';

export type SearchableSelectSize = 'sm' | 'md';

export type SearchableSelectOption = {
  value: string;
  label: string;
  /** Extra text included in cmdk filtering (defaults to label + value). */
  searchValue?: string;
  /** Optional muted secondary line under the label. */
  description?: string;
  disabled?: boolean;
  /** Optional decorative icon shown before the label in the list and the trigger. */
  icon?: React.ReactNode;
};

export type SearchableSelectGroup = {
  /** Group heading; an empty label renders the options without a heading. */
  label: string;
  options: SearchableSelectOption[];
};
