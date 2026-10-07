import { Loader2 } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from './command';
import {
  commandItemFilterValue,
  flattenSearchableSelectGroups,
  searchableSelectListClass,
} from './searchable-select-layout';
import { SearchableSelectOptionItem } from './searchable-select-option-item';
import type {
  SearchableSelectGroup,
  SearchableSelectOption,
  SearchableSelectSize,
} from './searchable-select-types';

export type SearchableSelectCommandProps = {
  groups: SearchableSelectGroup[];
  value: string;
  onValueChange: (value: string) => void;
  emptyText: string;
  searchPlaceholder: string;
  allowClear: boolean;
  size: SearchableSelectSize;
  loading: boolean;
  loadingText: string;
  showSearch: boolean;
  setOpen: (open: boolean) => void;
  onSearchChange?: (query: string) => void;
};

function onOptionChosen(
  option: SearchableSelectOption,
  value: string,
  allowClear: boolean,
  onValueChange: (next: string) => void,
  setOpen: (open: boolean) => void,
): void {
  if (option.disabled) {
    return;
  }
  if (!allowClear && value === option.value) {
    setOpen(false);
    return;
  }
  onValueChange(allowClear && value === option.value ? '' : option.value);
  setOpen(false);
}

function SearchableSelectGroupItems({
  group,
  ...props
}: SearchableSelectCommandProps & { group: SearchableSelectGroup }) {
  return (
    <CommandGroup heading={group.label || undefined}>
      {group.options.map((option) => (
        <SearchableSelectOptionItem
          key={option.value || '__empty__'}
          option={option}
          selected={props.value === option.value}
          size={props.size}
          onSelect={() =>
            onOptionChosen(option, props.value, props.allowClear, props.onValueChange, props.setOpen)
          }
        />
      ))}
    </CommandGroup>
  );
}

export function SearchableSelectCommand(props: SearchableSelectCommandProps) {
  const remote = props.onSearchChange != null;
  const empty = props.groups.every((group) => group.options.length === 0);
  const selected = flattenSearchableSelectGroups(props.groups).find(
    (option) => option.value === props.value,
  );
  return (
    <Command
      shouldFilter={!remote}
      defaultValue={selected ? commandItemFilterValue(selected) : undefined}
    >
      {props.showSearch ? (
        <CommandInput
          placeholder={props.searchPlaceholder}
          className="h-9"
          data-testid="searchable-select-search"
          onValueChange={props.onSearchChange}
        />
      ) : null}
      <CommandList className={searchableSelectListClass()}>
        {props.loading && empty ? (
          <div
            className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground"
            data-testid="searchable-select-loading"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {props.loadingText}
          </div>
        ) : null}
        <CommandEmpty className="py-3 text-sm">{props.emptyText}</CommandEmpty>
        {props.groups.map((group, index) => (
          <SearchableSelectGroupItems key={group.label || `__group_${index}`} group={group} {...props} />
        ))}
      </CommandList>
    </Command>
  );
}
