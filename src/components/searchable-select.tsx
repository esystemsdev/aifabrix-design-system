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
  flattenSearchableSelectGroups,
  resolveSearchableSelectGroups,
  searchableSelectPopoverClass,
  shouldShowSearchableSelectSearch,
} from './searchable-select-layout';
import { SearchableSelectCommand } from './searchable-select-command';
import type {
  SearchableSelectGroup,
  SearchableSelectOption,
  SearchableSelectSize,
} from './searchable-select-types';

export type { SearchableSelectGroup, SearchableSelectOption, SearchableSelectSize };
export {
  SEARCHABLE_SELECT_SEARCH_THRESHOLD,
  shouldShowSearchableSelectSearch,
} from './searchable-select-layout';

export type SearchableSelectProps = {
  /** Flat option list. Ignored when `groups` is non-empty. */
  options?: SearchableSelectOption[];
  /** Options listed under group headings; search matches across all groups. */
  groups?: SearchableSelectGroup[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  /**
   * Custom trigger content for the selected option (`null` when nothing is selected).
   * Return `null` or `undefined` to fall back to the default icon, label or placeholder.
   */
  renderValue?: (option: SearchableSelectOption | null) => React.ReactNode;
  /** Shown when the filter yields no matches. */
  emptyText?: string;
  /** Shown when there are no options and not loading. */
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
  groups: SearchableSelectGroup[];
  optionCount: number;
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

function SearchableSelectBody({ optionCount, noOptionsText, ...props }: BodyProps) {
  const remote = props.onSearchChange != null;
  if (!remote && props.loading && optionCount === 0) {
    return <LoadingBody loadingText={props.loadingText} />;
  }
  if (!remote && !props.loading && optionCount === 0) {
    return <EmptyOptionsBody noOptionsText={noOptionsText} />;
  }
  return <SearchableSelectCommand {...props} />;
}

function DefaultTriggerValue({
  option,
  placeholder,
}: {
  option: SearchableSelectOption | undefined;
  placeholder: string;
}) {
  if (!option) {
    return <span className="truncate">{placeholder}</span>;
  }
  return (
    <span className="flex min-w-0 items-center gap-2">
      {option.icon ? (
        <span className="flex shrink-0 items-center" aria-hidden>
          {option.icon}
        </span>
      ) : null}
      <span className="truncate">{option.label}</span>
    </span>
  );
}

function TriggerValue({
  option,
  placeholder,
  renderValue,
}: {
  option: SearchableSelectOption | undefined;
  placeholder: string;
  renderValue?: SearchableSelectProps['renderValue'];
}) {
  const custom = renderValue?.(option ?? null);
  if (custom !== null && custom !== undefined) {
    return <span className="min-w-0 truncate">{custom}</span>;
  }
  return <DefaultTriggerValue option={option} placeholder={placeholder} />;
}

type OpenState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  sessionKey: number;
  popoverOpen: boolean;
  expanded: boolean;
  handleOpenChange: (next: boolean) => void;
};

function useSearchableSelectOpen(
  presentation: ReturnType<typeof resolveFieldPresentation>,
  controlState: FieldState | undefined,
  disabled: boolean | undefined,
  onSearchChange: SearchableSelectProps['onSearchChange'],
): OpenState {
  const [open, setOpen] = React.useState(false);
  const [sessionKey, setSessionKey] = React.useState(0);
  const nativeDisabled = disabled ?? false;
  const effectiveDisabled = nativeDisabled || presentation.disabled;
  const canOpen = !presentation.hidden && !effectiveDisabled && !presentation.readOnly;
  const popoverOpen = controlState ? open && canOpen : open && !nativeDisabled;

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

  return {
    open,
    setOpen,
    sessionKey,
    popoverOpen,
    expanded: controlState ? popoverOpen : open,
    handleOpenChange,
  };
}

type TriggerProps = {
  props: SearchableSelectProps;
  presentation: ReturnType<typeof resolveFieldPresentation>;
  state: OpenState;
  listboxId: string;
  selectedOption: SearchableSelectOption | undefined;
  placeholder: string;
};

/** Returns the trigger element itself so `PopoverTrigger asChild` can merge its ref and handlers. */
function renderSearchableSelectTrigger({
  props,
  presentation,
  state,
  listboxId,
  selectedOption,
  placeholder,
}: TriggerProps) {
  const nativeDisabled = props.disabled ?? false;
  const effectiveDisabled = nativeDisabled || presentation.disabled;
  const describedBy = [props.describedBy, props.stateReasonId].filter(Boolean).join(' ') || undefined;
  return (
    <Button
      type="button"
      variant="outline"
      role="combobox"
      size={props.size === 'sm' ? 'sm' : 'default'}
      aria-label={props.ariaLabel || placeholder}
      aria-expanded={state.expanded}
      aria-controls={listboxId}
      aria-haspopup="listbox"
      aria-describedby={describedBy}
      aria-invalid={presentation.invalid || props.ariaInvalid || undefined}
      aria-readonly={presentation.readOnly || undefined}
      aria-busy={presentation.busy || undefined}
      disabled={props.controlState ? effectiveDisabled : nativeDisabled}
      data-control-state={props.controlState ? presentation.dataState : undefined}
      data-testid="searchable-select-trigger"
      className={cn('min-w-0 justify-between gap-2 font-normal', props.className)}
    >
      <TriggerValue option={selectedOption} placeholder={placeholder} renderValue={props.renderValue} />
      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
    </Button>
  );
}

function buildBodyProps(
  props: SearchableSelectProps,
  groups: SearchableSelectGroup[],
  optionCount: number,
  setOpen: (open: boolean) => void,
): BodyProps {
  return {
    groups,
    optionCount,
    value: props.value,
    onValueChange: props.onValueChange,
    emptyText: props.emptyText ?? 'No results found',
    noOptionsText: props.noOptionsText ?? 'No options available',
    searchPlaceholder: props.searchPlaceholder ?? 'Search…',
    allowClear: props.allowClear ?? true,
    size: props.size ?? 'md',
    loading: props.loading ?? false,
    loadingText: props.loadingText ?? 'Loading…',
    showSearch: shouldShowSearchableSelectSearch(optionCount, props.searchable),
    setOpen,
    onSearchChange: props.onSearchChange,
  };
}

export function SearchableSelect(props: SearchableSelectProps) {
  const { value, controlState, stateReasonId, disabled, size = 'md' } = props;
  const placeholder = props.placeholder ?? 'Select…';
  const groups = resolveSearchableSelectGroups(props.options, props.groups);
  const allOptions = flattenSearchableSelectGroups(groups);
  const selectedOption = allOptions.find((option) => option.value === value);
  const listboxId = React.useId();
  const presentation = resolveFieldPresentation(controlState);
  const state = useSearchableSelectOpen(presentation, controlState, disabled, props.onSearchChange);

  reportControlStateConflict(
    fieldStateConflict(controlState, { disabled }),
    presentation.reason ?? presentation.validationReason,
    stateReasonId,
  );

  if (presentation.hidden) return null;

  return (
    <Popover open={state.popoverOpen} onOpenChange={state.handleOpenChange}>
      <PopoverTrigger asChild>
        {renderSearchableSelectTrigger({
          props,
          presentation,
          state,
          listboxId,
          selectedOption,
          placeholder,
        })}
      </PopoverTrigger>
      <PopoverContent
        id={listboxId}
        align="start"
        collisionPadding={8}
        className={cn(searchableSelectPopoverClass(size), props.contentClassName)}
        data-testid="searchable-select-content"
      >
        <div key={state.sessionKey}>
          <SearchableSelectBody {...buildBodyProps(props, groups, allOptions.length, state.setOpen)} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
