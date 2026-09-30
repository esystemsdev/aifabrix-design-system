import { Badge } from './badge';
import { cn } from '../utils/cn';
import {
  statusToneIcon,
  statusToneToBadgeVariant,
  type StatusPresentation,
  type StatusTone,
} from './statusSemantics';

export type StatusBadgeProps = {
  tone: StatusTone;
  label: string;
  showIcon?: boolean;
  iconClassName?: string;
  className?: string;
} & Pick<StatusPresentation, 'icon'>;

export function StatusBadge({
  tone,
  label,
  showIcon = false,
  icon,
  iconClassName,
  className,
}: StatusBadgeProps) {
  const Icon = icon ?? statusToneIcon(tone);

  return (
    <Badge variant={statusToneToBadgeVariant(tone)} className={className}>
      {showIcon ? <Icon className={cn('size-3 shrink-0', iconClassName)} /> : null}
      {label}
    </Badge>
  );
}

export type StatusBadgeFromPresentationProps = {
  presentation: StatusPresentation;
  showIcon?: boolean;
  className?: string;
};

export function StatusBadgeFromPresentation({
  presentation,
  showIcon = false,
  className,
}: StatusBadgeFromPresentationProps) {
  return (
    <StatusBadge
      tone={presentation.tone}
      label={presentation.label}
      showIcon={showIcon}
      icon={presentation.icon}
      iconClassName={presentation.iconClassName}
      className={className}
    />
  );
}
