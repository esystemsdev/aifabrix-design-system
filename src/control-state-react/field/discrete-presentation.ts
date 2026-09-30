import type { FieldState } from "../../control-state";
import { resolveFieldPresentation, type FieldPresentation } from "./presentation";

export type DiscreteFieldPresentation = FieldPresentation &
  Readonly<{
    effectiveDisabled: boolean;
  }>;

export function resolveDiscreteFieldPresentation(
  state?: FieldState,
  nativeDisabled = false,
): DiscreteFieldPresentation {
  const presentation = resolveFieldPresentation(state);
  return {
    ...presentation,
    effectiveDisabled: nativeDisabled || presentation.disabled,
  };
}

export function isDiscreteSelectionKey(key: string, includeArrowKeys = false): boolean {
  if (key === " " || key === "Enter") return true;
  return includeArrowKeys && key.startsWith("Arrow");
}

export function suppressControlMutation(event: {
  preventDefault(): void;
  stopPropagation(): void;
}): void {
  event.preventDefault();
  event.stopPropagation();
}
