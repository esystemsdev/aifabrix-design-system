import { cn } from '../utils/cn';
import {
  resolveStatusIcon,
  STATUS_PROCESSING_ICON,
  STATUS_PROCESSING_ICON_CLASS,
  type StatusPresentation,
  type StatusTone,
} from './statusSemantics';

type StatusIconProps = {
  tone: StatusTone;
  className?: string;
  sizeClassName?: string;
  /** Accessible name; without it the icon is decorative. */
  label?: string;
  /** Spinner for in-flight states; an explicit `icon` still wins. */
  processing?: boolean;
  'data-testid'?: string;
} & Pick<StatusPresentation, 'icon' | 'iconClassName'>;

export function StatusIcon({
  tone,
  icon,
  iconClassName,
  className,
  sizeClassName = 'size-4',
  label,
  processing = false,
  'data-testid': dataTestId,
}: StatusIconProps) {
  const { Icon, className: resolvedIconClass } = resolveStatusIcon(tone, {
    icon: icon ?? (processing ? STATUS_PROCESSING_ICON : undefined),
    iconClassName,
  });
  const a11yProps = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const };

  return (
    <Icon
      {...a11yProps}
      data-testid={dataTestId}
      className={cn(
        sizeClassName,
        'shrink-0',
        resolvedIconClass,
        processing && STATUS_PROCESSING_ICON_CLASS,
        className,
      )}
    />
  );
}
