import { LayoutGrid, List, Search, UserPlus, Users } from 'lucide-react'
import { Link, Navigate } from 'react-router'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { PageHeader } from '@/components/common/PageHeader'
import { AthleteCard } from '@/components/modules/athletes/AthleteCard'
import { AthleteAssignmentFormDialog } from '@/components/modules/club/AthleteAssignmentFormDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { APP_MODULES } from '@/constants/navigation'
import { useAthleteDirectoryController } from '@/controllers/athletes/useAthleteDirectoryController'
import { useAthleteSelfRedirect } from '@/controllers/athletes/useAthleteSelfRedirect'
import { cn } from '@/lib/utils'
import { fullName } from '@/utils/text'

function DirectoryContent() {
  const controller = useAthleteDirectoryController()
  const emptyState = (
    <EmptyState
      icon={Users}
      title={
        controller.totalAthletes === 0
          ? 'Aún no hay deportistas registrados'
          : 'No encontramos deportistas con esos filtros'
      }
      description={
        controller.totalAthletes === 0
          ? 'Los deportistas crean su cuenta desde la página principal o el administrador la crea por ellos.'
          : 'Prueba con otro nombre o cambia la categoría en la barra superior.'
      }
    />
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={APP_MODULES.athletes.label}
        description={`Directorio de deportistas${
          controller.categoryName ? ` · ${controller.categoryName}` : ''
        }${controller.season ? ` en ${controller.season.name}` : ''}.`}
        action={
          controller.canAssign && (
            <Button onClick={controller.assignDialog.open}>
              <UserPlus aria-hidden="true" />
              Asignar deportista
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={controller.search}
            onChange={(event) => controller.setSearch(event.target.value)}
            placeholder="Buscar por nombre o apellido"
            aria-label="Buscar deportistas"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={controller.onlyUnassigned ? 'default' : 'outline'}
            onClick={controller.toggleUnassigned}
            aria-pressed={controller.onlyUnassigned}
          >
            Sin categoría ({controller.unassignedCount})
          </Button>
          <div
            className="flex rounded-lg border border-border p-0.5"
            role="group"
            aria-label="Vista"
          >
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Ver como tarjetas"
              aria-pressed={controller.viewMode === 'cards'}
              className={cn(controller.viewMode === 'cards' && 'bg-muted')}
              onClick={() => controller.setViewMode('cards')}
            >
              <LayoutGrid aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Ver como tabla"
              aria-pressed={controller.viewMode === 'table'}
              className={cn(controller.viewMode === 'table' && 'bg-muted')}
              onClick={() => controller.setViewMode('table')}
            >
              <List aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {controller.viewMode === 'table' ? (
        <DataTable
          caption="Deportistas"
          rows={controller.entries}
          getRowKey={(entry) => entry.id_user}
          pagination={controller.pagination}
          onPageChange={controller.setPage}
          isLoading={controller.isLoading}
          errorMessage={controller.errorMessage}
          onRetry={controller.retry}
          emptyState={emptyState}
          columns={[
            {
              key: 'name',
              header: 'Deportista',
              cell: (entry) => (
                <Link
                  to={controller.profilePath(entry.id_user)}
                  className="font-medium underline-offset-4 hover:text-primary hover:underline"
                >
                  {fullName(entry)}
                </Link>
              ),
            },
            {
              key: 'age',
              header: 'Edad',
              cell: (entry) => (entry.age !== null ? `${entry.age} años` : '—'),
            },
            {
              key: 'category',
              header: 'Categoría',
              cell: (entry) => entry.category_name ?? 'Sin categoría',
            },
            { key: 'position', header: 'Posición', cell: (entry) => entry.position ?? '—' },
          ]}
        />
      ) : controller.isLoading ? (
        <LoadingSkeleton variant="cards" rows={8} label="Cargando deportistas" />
      ) : controller.errorMessage ? (
        <ErrorState message={controller.errorMessage} onRetry={controller.retry} />
      ) : controller.entries.length === 0 ? (
        emptyState
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {controller.entries.map((entry) => (
              <li key={entry.id_user}>
                <AthleteCard entry={entry} href={controller.profilePath(entry.id_user)} />
              </li>
            ))}
          </ul>
          {controller.pagination.totalPages > 1 && (
            <nav
              aria-label="Paginación de deportistas"
              className="flex items-center justify-between text-sm text-muted-foreground"
            >
              <span>
                Página {controller.pagination.page} de {controller.pagination.totalPages} ·{' '}
                {controller.pagination.total} deportistas
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={controller.pagination.page <= 1}
                  onClick={() => controller.setPage(controller.pagination.page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={controller.pagination.page >= controller.pagination.totalPages}
                  onClick={() => controller.setPage(controller.pagination.page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </nav>
          )}
        </div>
      )}

      <AthleteAssignmentFormDialog
        open={controller.assignDialog.isOpen}
        onOpenChange={controller.assignDialog.setIsOpen}
        season={controller.season}
      />
    </div>
  )
}

export default function AthleteDirectoryView() {
  const selfPath = useAthleteSelfRedirect()
  if (selfPath) return <Navigate to={selfPath} replace />
  return <DirectoryContent />
}
