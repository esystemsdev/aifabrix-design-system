export type SearchableSelectSize = 'sm' | 'md';

export type SearchableSelectOption = {
  value: string;
  label: string;
  /** Extra text included in cmdk filtering (defaults to label + value). */
  searchValue?: string;
  /** Optional muted secondary line under the label. */
  description?: string;
  disabled?: boolean;
};
