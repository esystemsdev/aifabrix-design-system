import type { VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithoutRef, ComponentType } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  XCircle,
} from 'lucide-react';
import { badgeVariants } from './badge';

/**
 * Platform-wide semantic status tones.
 * SSOT for badge colors — aligned with /data/audit-logs/sync-logs (success, warning, danger, info).
 */
export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline';

/** Any SVG icon component (lucide-react of any version, other icon sets, or a custom SVG). */
export type IconComponent = ComponentType<ComponentPropsWithoutRef<'svg'>>;

export type StatusBadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

export type StatusPresentation = {
  tone: StatusTone;
  label: string;
  icon?: IconComponent;
  iconClassName?: string;
};

export function statusToneToBadgeVariant(tone: StatusTone): StatusBadgeVariant {
  if (tone === 'danger') {
    return 'destructive';
  }
  return tone;
}

const STATUS_TONE_ICONS: Record<StatusTone, IconComponent> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Clock,
  neutral: Circle,
  outline: Circle,
};

/** Standalone icon color (table rows, trace steps) — matches badge palette. */
export const STATUS_TONE_ICON_CLASS: Record<StatusTone, string> = {
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  danger: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  neutral: 'text-muted-foreground',
  outline: 'text-muted-foreground',
};

/** Left border accent for category-colored rows (workflow steps, trace lists). */
export const STATUS_TONE_BORDER_CLASS: Record<StatusTone, string> = {
  success: 'border-l-4 border-l-green-600 dark:border-l-green-400',
  warning: 'border-l-4 border-l-yellow-600 dark:border-l-yellow-400',
  danger: 'border-l-4 border-l-red-600 dark:border-l-red-400',
  info: 'border-l-4 border-l-blue-600 dark:border-l-blue-400',
  neutral: 'border-l-4 border-l-muted-foreground',
  outline: 'border-l-4 border-l-border',
};

export function statusToneIcon(tone: StatusTone): IconComponent {
  return STATUS_TONE_ICONS[tone];
}

export function statusToneIconClassName(tone: StatusTone): string {
  return STATUS_TONE_ICON_CLASS[tone];
}

export function resolveStatusIcon(
  tone: StatusTone,
  presentation?: Pick<StatusPresentation, 'icon' | 'iconClassName'>,
): { Icon: IconComponent; className: string } {
  const Icon = presentation?.icon ?? statusToneIcon(tone);
  const className = presentation?.iconClassName ?? statusToneIconClassName(tone);
  return { Icon, className };
}

/** ok / warning / error health-check style statuses (diagnostics, sync runner). */
export function healthCheckStatusPresentation(
  status: 'ok' | 'warning' | 'error' | 'failed',
): StatusPresentation {
  if (status === 'ok') {
    return { tone: 'success', label: 'OK' };
  }
  if (status === 'warning') {
    return { tone: 'warning', label: 'Warning' };
  }
  return { tone: 'danger', label: status === 'failed' ? 'Failed' : 'Error' };
}

export function formatHumanizedStatusLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Unknown';
  }
  return trimmed
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Spinning loader for in-flight processing states. */
export const STATUS_PROCESSING_ICON = Loader2;
export const STATUS_PROCESSING_ICON_CLASS = 'animate-spin';

/** Alert icon for failed sync jobs on dashboard. */
export const STATUS_FAILED_ALERT_ICON = AlertCircle;
