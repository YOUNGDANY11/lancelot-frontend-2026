import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Pagination } from '@/types/api'

export function PaginationNav({
  label,
  pagination,
  onPageChange,
  itemsLabel = 'registros',
}: {
  label: string
  pagination: Pagination
  onPageChange: (page: number) => void
  itemsLabel?: string
}) {
  return (
    <nav
      aria-label={label}
      className="flex items-center justify-between gap-3 text-sm text-muted-foreground"
    >
      <span>
        Página {pagination.page} de {pagination.totalPages} · {pagination.total} {itemsLabel}
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
  )
}
