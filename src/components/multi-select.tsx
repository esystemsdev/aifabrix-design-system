import * as React from 'react';
import { X } from 'lucide-react';
import type { FieldState } from '../control-state';
import {
  isDiscreteSelectionKey,
  reportControlStateConflict,
  resolveFieldPresentation,
  suppressControlMutation,
} from '../control-state-react';
import { Badge } from './badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { buttonVariants } from './button';
import { cn } from '../utils/cn';

export interface MultiSelectOption {
  value: string;
  label: string;
  searchValue?: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  controlState?: FieldState;
  stateReasonId?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  emptyText = 'No results found',
  className,
  controlState,
  stateReasonId,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const presentation = resolveFieldPresentation(controlState);
  const canMutate = !presentation.hidden && !presentation.disabled && !presentation.readOnly;
  const popoverOpen = controlState ? open && canMutate : open;

  reportControlStateConflict(
    undefined,
    presentation.reason ?? presentation.validationReason,
    stateReasonId,
  );

  React.useEffect(() => {
    if (controlState && !canMutate && open) {
      setOpen(false);
    }
  }, [canMutate, controlState, open]);

  const commandItemValue = (option: MultiSelectOption) =>
    option.searchValue ?? `${option.label} ${option.value}`;

  const handleUnselect = (item: string) => {
    if (controlState && !canMutate) return;
    onChange(selected.filter((s) => s !== item));
  };

  const handleToggle = (value: string) => {
    if (controlState && !canMutate) return;
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (controlState && !canMutate) return;
    setOpen(next);
  };

  if (presentation.hidden) return null;

  return (
    <Popover open={popoverOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={popoverOpen}
          aria-readonly={controlState ? presentation.readOnly || undefined : undefined}
          aria-disabled={controlState ? presentation.disabled || undefined : undefined}
          aria-busy={presentation.busy || undefined}
          aria-invalid={presentation.invalid || undefined}
          aria-describedby={controlState ? stateReasonId : undefined}
          data-control-state={controlState ? presentation.dataState : undefined}
          tabIndex={controlState && presentation.disabled ? -1 : 0}
          onClickCapture={controlState && !canMutate ? suppressControlMutation : undefined}
          onKeyDownCapture={
            controlState && !canMutate
              ? (event) => {
                  if (isDiscreteSelectionKey(event.key, true)) {
                    suppressControlMutation(event);
                  }
                }
              : undefined
          }
          className={cn(
            buttonVariants({ variant: 'outline', size: 'default' }),
            'h-auto min-h-10 w-full justify-start py-2 font-normal',
            controlState && presentation.disabled && 'pointer-events-none opacity-50',
            className,
          )}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1">
            {selected.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {selected.map((item) => {
              const option = options.find((o) => o.value === item);
              const label = option?.label ?? item;
              return (
                <Badge variant="secondary" key={item} className="shrink-0 gap-1">
                  {label}
                  <span
                    role="button"
                    tabIndex={controlState && !canMutate ? -1 : 0}
                    aria-label={`Remove ${label}`}
                    aria-disabled={controlState && !canMutate ? true : undefined}
                    className={cn(
                      'ml-0.5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      controlState && (canMutate ? 'cursor-pointer' : 'cursor-default'),
                    )}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnselect(item);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnselect(item);
                    }}
                  >
                    <X
                      className={cn(
                        'h-3 w-3',
                        controlState
                          ? canMutate
                            ? 'text-secondary-foreground'
                            : 'text-secondary-foreground/40'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    />
                  </span>
                </Badge>
              );
            })}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className={cn('w-[300px] max-w-[min(90vw,24rem)] p-0')}>
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={commandItemValue(option)}
                    onSelect={() => handleToggle(option.value)}
                  >
                    <div
                      className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      }`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
