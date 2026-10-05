import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { Pagination } from '@/types/api'

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  caption: string
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string | number
  pagination?: Pagination
  onPageChange?: (page: number) => void
  isLoading?: boolean
  errorMessage?: string
  onRetry?: () => void
  emptyState?: ReactNode
  onRowClick?: (row: T) => void
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowKey,
  pagination,
  onPageChange,
  isLoading = false,
  errorMessage,
  onRetry,
  emptyState,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading)
    return <LoadingSkeleton variant="table" label={`Cargando ${caption.toLowerCase()}`} />
  if (errorMessage) return <ErrorState message={errorMessage} onRetry={onRetry} />
  if (rows.length === 0) {
    return emptyState ?? <EmptyState icon={Inbox} title="No hay registros para mostrar" />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableCaption className="sr-only">{caption}</TableCaption>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={getRowKey(row)}
                className={cn(onRowClick && 'cursor-pointer')}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pagination && onPageChange && pagination.totalPages > 1 && (
        <nav
          aria-label={`Paginación de ${caption.toLowerCase()}`}
          className="flex items-center justify-between gap-3 text-sm text-muted-foreground"
        >
          <span>
            Página {pagination.page} de {pagination.totalPages} · {pagination.total} registros
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="Página anterior"
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Página siguiente"
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </nav>
      )}
    </div>
  )
}
