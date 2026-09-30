/**
 * Standard searchable single-select (popover + cmdk).
 *
 * Short status / lifecycle enums should keep using Radix `Select` (`ui/select`) —
 * do not migrate 3–5 value enums into SearchableSelect.
 *
 * @see `.cursor/plans/507.0-searchable-select-standard.plan.md`
 */
import * as React from 'react';
import { ChevronsUpDown, Loader2 } from 'lucide-react';
import type { FieldState } from '../control-state';
import {
  fieldStateConflict,
  reportControlStateConflict,
  resolveFieldPresentation,
} from '../control-state-react';
import { cn } from '../utils/cn';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import {
  searchableSelectPopoverClass,
  shouldShowSearchableSelectSearch,
} from './searchable-select-layout';
import { SearchableSelectCommand } from './searchable-select-command';
import type { SearchableSelectOption, SearchableSelectSize } from './searchable-select-types';

export type { SearchableSelectOption, SearchableSelectSize };
export {
  SEARCHABLE_SELECT_SEARCH_THRESHOLD,
  shouldShowSearchableSelectSearch,
} from './searchable-select-layout';

export type SearchableSelectProps = {
  options: SearchableSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  /** Shown when the filter yields no matches. */
  emptyText?: string;
  /** Shown when `options` is empty and not loading. */
  noOptionsText?: string;
  searchPlaceholder?: string;
  className?: string;
  /** Merged with standard popover width rules (does not replace them). */
  contentClassName?: string;
  ariaLabel?: string;
  /** Ids of elements describing this control (e.g. a validation message). */
  describedBy?: string;
  /** Marks the control invalid for assistive technology, not by color alone. */
  ariaInvalid?: boolean;
  disabled?: boolean;
  /** When false, re-selecting the current option keeps the value (forms). Default true (filters). */
  allowClear?: boolean;
  size?: SearchableSelectSize;
  /** Force or disable in-popover search. Default: auto by option count. */
  searchable?: boolean;
  loading?: boolean;
  loadingText?: string;
  controlState?: FieldState;
  stateReasonId?: string;
  /** When set, typing searches remotely; cmdk client filtering is disabled. */
  onSearchChange?: (query: string) => void;
};

type BodyProps = {
  options: SearchableSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  emptyText: string;
  noOptionsText: string;
  searchPlaceholder: string;
  allowClear: boolean;
  size: SearchableSelectSize;
  loading: boolean;
  loadingText: string;
  showSearch: boolean;
  setOpen: (open: boolean) => void;
  onSearchChange?: (query: string) => void;
};

function LoadingBody({ loadingText }: { loadingText: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground"
      data-testid="searchable-select-loading"
    >
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {loadingText}
    </div>
  );
}

function EmptyOptionsBody({ noOptionsText }: { noOptionsText: string }) {
  return (
    <div
      className="px-3 py-3 text-center text-sm text-muted-foreground"
      data-testid="searchable-select-no-options"
    >
      {noOptionsText}
    </div>
  );
}

function SearchableSelectBody(props: BodyProps) {
  const remote = props.onSearchChange != null;
  if (!remote && props.loading && props.options.length === 0) {
    return <LoadingBody loadingText={props.loadingText} />;
  }
  if (!remote && !props.loading && props.options.length === 0) {
    return <EmptyOptionsBody noOptionsText={props.noOptionsText} />;
  }
  return <SearchableSelectCommand {...props} />;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  emptyText = 'No results found',
  noOptionsText = 'No options available',
  searchPlaceholder = 'Search…',
  className,
  contentClassName,
  ariaLabel,
  describedBy,
  ariaInvalid,
  disabled,
  allowClear = true,
  size = 'md',
  searchable,
  loading = false,
  loadingText = 'Loading…',
  controlState,
  stateReasonId,
  onSearchChange,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [sessionKey, setSessionKey] = React.useState(0);
  const selectedOption = options.find((option) => option.value === value);
  const showSearch = shouldShowSearchableSelectSearch(options.length, searchable);
  const listboxId = React.useId();
  const presentation = resolveFieldPresentation(controlState);
  const nativeDisabled = disabled ?? false;
  const effectiveDisabled = nativeDisabled || presentation.disabled;
  const canOpen = !presentation.hidden && !effectiveDisabled && !presentation.readOnly;
  const popoverOpen = controlState ? open && canOpen : open && !nativeDisabled;
  const expanded = controlState ? popoverOpen : open;
  const resolvedDescribedBy =
    [describedBy, stateReasonId].filter(Boolean).join(' ') || undefined;

  reportControlStateConflict(
    fieldStateConflict(controlState, { disabled }),
    presentation.reason ?? presentation.validationReason,
    stateReasonId,
  );

  React.useEffect(() => {
    if (controlState && !canOpen && open) {
      setOpen(false);
    }
  }, [canOpen, controlState, open]);

  const handleOpenChange = (next: boolean) => {
    if (nativeDisabled || (controlState && !canOpen)) {
      return;
    }
    setOpen(next);
    if (next) {
      setSessionKey((key) => key + 1);
    } else if (onSearchChange) {
      onSearchChange('');
    }
  };

  if (presentation.hidden) return null;

  return (
    <Popover open={popoverOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          size={size === 'sm' ? 'sm' : 'default'}
          aria-label={ariaLabel || placeholder}
          aria-expanded={expanded}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-describedby={resolvedDescribedBy}
          aria-invalid={presentation.invalid || ariaInvalid || undefined}
          aria-readonly={presentation.readOnly || undefined}
          aria-busy={presentation.busy || undefined}
          disabled={controlState ? effectiveDisabled : nativeDisabled}
          data-control-state={controlState ? presentation.dataState : undefined}
          data-testid="searchable-select-trigger"
          className={cn('min-w-0 justify-between gap-2 font-normal', className)}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        id={listboxId}
        align="start"
        collisionPadding={8}
        className={cn(searchableSelectPopoverClass(size), contentClassName)}
        data-testid="searchable-select-content"
      >
        <div key={sessionKey}>
          <SearchableSelectBody
            options={options}
            value={value}
            onValueChange={onValueChange}
            emptyText={emptyText}
            noOptionsText={noOptionsText}
            searchPlaceholder={searchPlaceholder}
            allowClear={allowClear}
            size={size}
            loading={loading}
            loadingText={loadingText}
            showSearch={showSearch}
            setOpen={setOpen}
            onSearchChange={onSearchChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
