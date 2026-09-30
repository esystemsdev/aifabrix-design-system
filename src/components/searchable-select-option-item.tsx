import { Check } from 'lucide-react';
import { cn } from '../utils/cn';
import { CommandItem } from './command';
import { commandItemFilterValue } from './searchable-select-layout';
import type { SearchableSelectOption } from './searchable-select-types';

type SearchableSelectOptionItemProps = {
  option: SearchableSelectOption;
  selected: boolean;
  size: 'sm' | 'md';
  onSelect: () => void;
};

export function SearchableSelectOptionItem({
  option,
  selected,
  size,
  onSelect,
}: SearchableSelectOptionItemProps) {
  return (
    <CommandItem
      value={commandItemFilterValue(option)}
      disabled={option.disabled}
      data-testid={`searchable-select-option-${option.value || 'empty'}`}
      onSelect={onSelect}
      className={cn(
        'gap-2',
        size === 'sm' ? 'min-h-9 py-1.5' : 'min-h-10 py-2',
        selected && 'bg-accent/60',
      )}
    >
      <Check
        className={cn('h-4 w-4 shrink-0', selected ? 'opacity-100' : 'opacity-0')}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate" title={option.label}>
          {option.label}
        </span>
        {option.description ? (
          <span className="block truncate text-xs text-muted-foreground" title={option.description}>
            {option.description}
          </span>
        ) : null}
      </span>
    </CommandItem>
  );
}
