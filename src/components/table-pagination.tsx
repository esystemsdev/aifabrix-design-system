import { Button } from './button';

export type TablePaginationProps = {
  page: number;
  pageCount: number;
  totalItems: number;
  isLoading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

/** Shared Previous / Next controls for paginated tables. */
export function TablePagination({
  page,
  pageCount,
  totalItems,
  isLoading = false,
  onPrevious,
  onNext,
}: TablePaginationProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
        {totalItems > 0 ? ` · ${totalItems} total` : ''}
      </p>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1 || isLoading}
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= pageCount || isLoading}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
