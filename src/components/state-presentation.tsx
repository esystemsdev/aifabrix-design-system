import * as React from 'react';
import { AlertCircle, FileQuestion, Inbox, RefreshCw, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { cn } from '../utils/cn';

export interface ErrorStateProps {
  /** Presentation tier — page uses GlobalStatusPage via PlatformErrorPage at call sites */
  layout?: 'page' | 'region' | 'inline' | 'card';
  /** Error message or title */
  title?: string;
  /** Detailed error description */
  description?: string;
  /** Error object (will extract message from it) */
  error?: Error | string | null;
  /** Action button label */
  actionLabel?: string;
  /** Action button click handler */
  onAction?: () => void;
  /** Additional className for primary action button */
  actionClassName?: string;
  /** Secondary action button label */
  secondaryActionLabel?: string;
  /** Secondary action button click handler */
  onSecondaryAction?: () => void;
  /** Show retry button */
  showRetry?: boolean;
  /** Retry handler */
  onRetry?: () => void;
  /** Show back button */
  showBack?: boolean;
  /** Back button handler */
  onBack?: () => void;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Full height container */
  fullHeight?: boolean;
  /** Turns the raw error text into the displayed heading (e.g. problem-detail humanization) */
  formatErrorMessage?: (raw: string) => string;
  /** Show `error.message` as description when no description is given */
  showErrorDetails?: boolean;
}

type ErrorStateActionsProps = Pick<
  ErrorStateProps,
  | 'actionLabel'
  | 'onAction'
  | 'actionClassName'
  | 'secondaryActionLabel'
  | 'onSecondaryAction'
  | 'showRetry'
  | 'onRetry'
  | 'showBack'
  | 'onBack'
>;

const trimErrorMessage = (raw: string): string => raw.trim();

function resolveRawErrorMessage(error: ErrorStateProps['error'], title: string): string {
  if (error instanceof Error) {
    return error.message ?? title;
  }
  return typeof error === 'string' ? error : title;
}

function ErrorStateActions({
  actionLabel,
  onAction,
  actionClassName,
  secondaryActionLabel,
  onSecondaryAction,
  showRetry,
  onRetry,
  showBack,
  onBack,
}: ErrorStateActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {showBack && onBack && (
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft />
          Go Back
        </Button>
      )}
      {showRetry && onRetry && (
        <Button onClick={onRetry}>
          <RefreshCw />
          Retry
        </Button>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className={actionClassName}>
          {actionLabel}
        </Button>
      )}
      {secondaryActionLabel && onSecondaryAction && (
        <Button variant="outline" onClick={onSecondaryAction}>
          {secondaryActionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Generic error state component
 */
export function ErrorState({
  layout = 'region',
  title = 'Something went wrong',
  description,
  error,
  icon,
  className,
  fullHeight = true,
  formatErrorMessage = trimErrorMessage,
  showErrorDetails = false,
  showRetry = false,
  showBack = false,
  ...actions
}: ErrorStateProps) {
  const resolvedLayout = layout === 'card' ? 'region' : layout;
  const errorMessage = formatErrorMessage(resolveRawErrorMessage(error, title));
  const displayDescription =
    description ?? (error instanceof Error && showErrorDetails ? error.message : undefined);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        fullHeight ? 'min-h-[400px]' : 'py-12',
        resolvedLayout === 'inline' && 'py-4',
        className,
      )}
      data-layout={resolvedLayout}
    >
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {icon || <AlertCircle className="w-12 h-12 text-destructive" />}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold break-words">{errorMessage}</h3>
              {displayDescription && (
                <p className="text-sm text-muted-foreground">{displayDescription}</p>
              )}
            </div>
            <ErrorStateActions showRetry={showRetry} showBack={showBack} {...actions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export interface NotFoundStateProps {
  /** Presentation tier */
  layout?: 'page' | 'region' | 'inline' | 'card';
  /** Resource name (e.g., "Datasource", "System") */
  resource?: string;
  /** Resource identifier */
  identifier?: string;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
  /** Show back button */
  showBack?: boolean;
  /** Back button handler */
  onBack?: () => void;
  /** Action button label */
  actionLabel?: string;
  /** Action button click handler */
  onAction?: () => void;
  /** Custom className */
  className?: string;
  /** Full height container */
  fullHeight?: boolean;
}

/**
 * Not found (404) state component
 */
export function NotFoundState({
  resource = 'Resource',
  identifier,
  title,
  description,
  showBack = true,
  onBack,
  actionLabel,
  onAction,
  className,
  fullHeight = true,
}: NotFoundStateProps) {
  const displayTitle = title || `${resource} not found`;
  const displayDescription =
    description ||
    (identifier
      ? `The ${resource.toLowerCase()} "${identifier}" could not be found.`
      : `The requested ${resource.toLowerCase()} could not be found.`);

  return (
    <ErrorState title={displayTitle}
      description={displayDescription}
      icon={<FileQuestion className="w-12 h-12 text-muted-foreground" />}
      showBack={showBack}
      onBack={onBack}
      actionLabel={actionLabel}
      onAction={onAction}
      className={className}
      fullHeight={fullHeight}
    />
  );
}

export interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action button label */
  actionLabel?: string;
  /** Action button click handler */
  onAction?: () => void;
  /** Secondary action button label */
  secondaryActionLabel?: string;
  /** Secondary action button click handler */
  onSecondaryAction?: () => void;
  /** Custom className */
  className?: string;
  /** Full height container */
  fullHeight?: boolean;
  /** Padding size */
  padding?: 'sm' | 'md' | 'lg';
}

const EMPTY_STATE_PADDING_CLASSES = {
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16',
} as const;

/**
 * Empty state component for when there's no data
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  fullHeight = true,
  padding = 'md',
}: EmptyStateProps) {
  return (
    <div className={cn(
        'flex flex-col items-center justify-center text-center',
        fullHeight ? 'min-h-[400px]' : EMPTY_STATE_PADDING_CLASSES[padding],
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4 max-w-md">
        {icon || <Inbox className="w-12 h-12 text-muted-foreground opacity-50" />}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {actionLabel && onAction && (
              <Button onClick={onAction}>{actionLabel}</Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button variant="outline" onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export interface LoadingStateProps {
  /** Loading message */
  message?: string;
  /** Custom spinner */
  spinner?: React.ReactNode;
  /** Full height container */
  fullHeight?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Loading state component — standard app-ui spinner + label.
 * Prefer this over ad-hoc “Loading…” text in cards and panels.
 */
export function LoadingState({
  message = 'Loading...',
  spinner,
  fullHeight = true,
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center',
        fullHeight ? 'min-h-[400px]' : 'py-12',
        className
      )}
    >
      {spinner || (
        <div className="flex flex-col items-center space-y-4">
          <Loader2
            className="w-8 h-8 text-muted-foreground animate-spin"
            aria-hidden
          />
          {message ? (
            <p className="text-sm text-muted-foreground">{message}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
