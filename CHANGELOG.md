# Changelog

## 0.2.0

- SearchableSelect: optional `groups` (options under headings, searched across all groups), option `icon`
  (shown in the list and the trigger) and `renderValue` (custom trigger content). `options` is optional when
  `groups` is set. Existing `options`-only usage is unchanged.
- CardTitle: `asChild` renders the child element, for example another heading level. The default stays `<h4>`.
- Alert: AlertTitle and AlertDescription wrap long unbroken text (URLs, IDs, error messages) instead of
  widening the alert.
- Behavior tests for Alert, AlertDialog, Checkbox, Label, Popover, Progress, RadioGroup, Separator, Sheet,
  Skeleton, Switch, Textarea and Tooltip.

## 0.1.2

- Runtime dependencies use compatible version ranges instead of exact versions, so applications that already
  depend on Radix UI, `lucide-react` or `tailwind-merge` install one copy.
- The build emits one module per component behind the same entry points, so application bundlers can place each
  component in the route chunk that uses it instead of the initial chunk. Public imports are unchanged; no
  component changes.

## 0.1.1

- MultiSelect: the trigger opens the option list with Enter, Space or ArrowDown. A disabled or read-only
  `controlState` still blocks opening.
- ConfirmationDialog: closing a controlled dialog returns focus to the element that was focused when it opened.

## 0.1.0

- Initial release extracted from AI Fabrix Dataplane `app-ui`: Alert, AlertDialog, Badge, Button, Card, Checkbox,
  ConfirmationDialog, Dialog, DropdownMenu, Input, Label, MultiSelect, Popover, Progress, RadioGroup,
  SearchableSelect, Select, Separator, Sheet, Skeleton, Switch, Table, TablePagination, Textarea, Tooltip,
  StatusBadge, StatusIcon, status semantics, EmptyState, LoadingState, ErrorState, NotFoundState and `cn`.
- Control-state core (`@aifabrix/ui/control-state`) and React bindings (`@aifabrix/ui/control-state-react`).
- Runtime dependencies pinned to the exact versions used by Dataplane at extraction time.
- MultiSelect: the badge remove icon and the selected-option check now contrast with their filled background in
  light mode.
