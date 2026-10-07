import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { PaginationNav } from '@/components/common/PaginationNav'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import type { Pagination } from '@/types/api'

export type MobileColumnRole = 'title' | 'actions' | 'field' | 'full'

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  mobile?: MobileColumnRole
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

const COMPACT_QUERY = '(max-width: 639px)'

function mobileRole<T>(column: DataTableColumn<T>, index: number): MobileColumnRole {
  if (column.mobile) return column.mobile
  if (column.key === 'actions') return 'actions'
  return index === 0 ? 'title' : 'field'
}

function CardList<T>({
  caption,
  columns,
  rows,
  getRowKey,
  onRowClick,
}: Pick<DataTableProps<T>, 'caption' | 'columns' | 'rows' | 'getRowKey' | 'onRowClick'>) {
  const roles = columns.map((column, index) => ({ column, role: mobileRole(column, index) }))
  const title = roles.find((item) => item.role === 'title')?.column
  const actions = roles.filter((item) => item.role === 'actions').map((item) => item.column)
  const fields = roles.filter((item) => item.role === 'field').map((item) => item.column)
  const full = roles.filter((item) => item.role === 'full').map((item) => item.column)

  return (
    <ul aria-label={caption} className="flex flex-col gap-3">
      {rows.map((row) => (
        <li
          key={getRowKey(row)}
          className={cn(
            'flex flex-col gap-3 rounded-xl border border-border bg-card p-4',
            onRowClick && 'cursor-pointer',
          )}
          onClick={onRowClick ? () => onRowClick(row) : undefined}
        >
          {(title || actions.length > 0) && (
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 font-medium">{title?.cell(row)}</div>
              {actions.map((column) => (
                <div key={column.key} className="shrink-0">
                  {column.cell(row)}
                </div>
              ))}
            </div>
          )}
          {fields.length > 0 && (
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
              {fields.map((column) => (
                <div key={column.key} className="contents">
                  <dt className="text-muted-foreground">{column.header}</dt>
                  <dd className="min-w-0 text-right tabular-nums">{column.cell(row)}</dd>
                </div>
              ))}
            </dl>
          )}
          {full.map((column) => (
            <div key={column.key} className="[&>*]:w-full">
              {column.cell(row)}
            </div>
          ))}
        </li>
      ))}
    </ul>
  )
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
  const isCompact = useMediaQuery(COMPACT_QUERY)

  if (isLoading)
    return <LoadingSkeleton variant="table" label={`Cargando ${caption.toLowerCase()}`} />
  if (errorMessage) return <ErrorState message={errorMessage} onRetry={onRetry} />
  if (rows.length === 0) {
    return emptyState ?? <EmptyState icon={Inbox} title="No hay registros para mostrar" />
  }

  return (
    <div className="flex flex-col gap-3">
      {isCompact ? (
        <CardList
          caption={caption}
          columns={columns}
          rows={rows}
          getRowKey={getRowKey}
          onRowClick={onRowClick}
        />
      ) : (
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
      )}
      {pagination && onPageChange && pagination.totalPages > 1 && (
        <PaginationNav
          label={`Paginación de ${caption.toLowerCase()}`}
          pagination={pagination}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
