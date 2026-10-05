import {
  Ban,
  CircleCheck,
  ExternalLink,
  FileCheck,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { RowActionsMenu, type RowAction } from '@/components/common/RowActionsMenu'
import { SelectInput } from '@/components/common/SelectInput'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { ParentalConsentFormSheet } from '@/components/modules/health/ParentalConsentFormSheet'
import { Button } from '@/components/ui/button'
import { PARENTAL_CONSENT_STATUS } from '@/constants/enums'
import { useConsentsTabController } from '@/controllers/health/useConsentsTabController'
import type { ParentalConsent } from '@/types/club'
import { formatDate } from '@/utils/formatDate'

function athleteOf(consent: ParentalConsent) {
  return consent.athlete_name || 'el deportista'
}

export function ConsentsTab() {
  const controller = useConsentsTabController()
  const { minors, sheet, pendingAction } = controller

  const actionsFor = (consent: ParentalConsent): RowAction[] => [
    { label: 'Editar', icon: Pencil, onSelect: () => controller.openEdit(consent) },
    ...(consent.status !== 'granted'
      ? [
          {
            label: 'Marcar como otorgado',
            icon: CircleCheck,
            onSelect: () => controller.grant(consent),
          },
        ]
      : [{ label: 'Revocar', icon: Ban, onSelect: () => controller.askRevoke(consent) }]),
    {
      label: 'Eliminar',
      icon: Trash2,
      destructive: true,
      onSelect: () => controller.askDelete(consent),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <TabToolbar description="Autorización de los acudientes para tratar los datos de salud de menores de edad (Ley 1581 de 2012).">
        <Button onClick={() => controller.openCreate()}>
          <Plus aria-hidden="true" />
          Registrar consentimiento
        </Button>
      </TabToolbar>

      <section
        aria-labelledby="menores-sin-consentimiento"
        className="flex flex-col gap-3 rounded-2xl border border-risk-medium/40 bg-risk-medium/5 p-4"
      >
        <h3
          id="menores-sin-consentimiento"
          className="flex items-center gap-2 text-base font-semibold"
        >
          <TriangleAlert aria-hidden="true" className="size-5 text-risk-medium" />
          Menores sin consentimiento otorgado
          {!minors.isLoading && (
            <span className="text-sm font-normal text-muted-foreground tabular-nums">
              ({minors.items.length})
            </span>
          )}
        </h3>
        {minors.isLoading ? (
          <LoadingSkeleton rows={2} label="Buscando menores sin consentimiento" />
        ) : minors.errorMessage ? (
          <ErrorState message={minors.errorMessage} />
        ) : minors.items.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CircleCheck aria-hidden="true" className="size-4 text-risk-low" />
            Todos los menores tienen el consentimiento del acudiente otorgado.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {minors.items.map((minor) => (
              <li
                key={minor.id_user}
                className="flex flex-wrap items-center justify-between gap-3 py-2.5"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="font-medium">{minor.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {minor.age !== null ? `${minor.age} años · ` : ''}
                    {minor.latest
                      ? `Último: ${PARENTAL_CONSENT_STATUS.labels[minor.latest.status].toLowerCase()} (${formatDate(minor.latest.signed_at)})`
                      : 'Sin consentimiento registrado'}
                  </span>
                </div>
                {minor.latest?.status === 'pending' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => minor.latest && controller.grant(minor.latest)}
                    disabled={controller.isActing}
                  >
                    <CircleCheck aria-hidden="true" />
                    Marcar como otorgado
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => controller.openCreate(minor.id_user)}
                    aria-label={`Registrar consentimiento de ${minor.name}`}
                  >
                    <FileCheck aria-hidden="true" />
                    Registrar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="sm:max-w-60">
        <SelectInput
          aria-label="Filtrar por estado"
          value={controller.status}
          onValueChange={controller.setStatus}
          options={controller.statusOptions}
        />
      </div>

      <DataTable
        caption="Consentimientos"
        rows={controller.consents}
        getRowKey={(consent) => consent.id_consent}
        pagination={controller.pagination}
        onPageChange={controller.setPage}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={
          <EmptyState
            icon={FileCheck}
            title={
              controller.hasFilters
                ? 'Ningún consentimiento con ese estado'
                : 'Aún no hay consentimientos registrados'
            }
          />
        }
        columns={[
          {
            key: 'athlete',
            header: 'Deportista',
            cell: (consent) => <span className="font-medium">{consent.athlete_name || '—'}</span>,
          },
          {
            key: 'guardian',
            header: 'Acudiente',
            cell: (consent) => (
              <span className="flex flex-col">
                <span>{consent.guardian_name}</span>
                <span className="text-xs text-muted-foreground">
                  {consent.guardian_relationship} · Doc. {consent.guardian_document}
                </span>
              </span>
            ),
          },
          {
            key: 'signed',
            header: 'Firma',
            className: 'tabular-nums',
            cell: (consent) => formatDate(consent.signed_at),
          },
          {
            key: 'status',
            header: 'Estado',
            cell: (consent) => (
              <StatusBadge
                label={PARENTAL_CONSENT_STATUS.labels[consent.status]}
                tone={PARENTAL_CONSENT_STATUS.tones[consent.status]}
              />
            ),
          },
          {
            key: 'document',
            header: 'Documento',
            cell: (consent) =>
              consent.document_url ? (
                <a
                  href={consent.document_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Ver
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                  <span className="sr-only">
                    documento de {athleteOf(consent)} (abre otra pestaña)
                  </span>
                </a>
              ) : (
                '—'
              ),
          },
          {
            key: 'actions',
            header: <span className="sr-only">Acciones</span>,
            className: 'w-12 text-right',
            cell: (consent) => (
              <RowActionsMenu
                subject={`el consentimiento de ${athleteOf(consent)}`}
                actions={actionsFor(consent)}
              />
            ),
          },
        ]}
      />

      <ParentalConsentFormSheet
        open={sheet.mode !== 'closed'}
        onOpenChange={(open) => !open && controller.closeSheet()}
        consent={sheet.mode === 'edit' ? sheet.consent : null}
        initialAthleteId={sheet.mode === 'create' ? sheet.athleteId : undefined}
      />
      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && controller.cancelAction()}
        title={
          pendingAction?.kind === 'revoke'
            ? `¿Revocar el consentimiento de ${athleteOf(pendingAction.consent)}?`
            : `¿Eliminar el consentimiento de ${pendingAction ? athleteOf(pendingAction.consent) : 'el deportista'}?`
        }
        description={
          pendingAction?.kind === 'revoke'
            ? 'Mientras no haya otro consentimiento otorgado, no se podrán crear ni editar sus registros de salud.'
            : 'Esta acción no se puede deshacer. Si es el único consentimiento otorgado, el menor quedará sin autorización.'
        }
        confirmLabel={pendingAction?.kind === 'revoke' ? 'Revocar' : 'Eliminar'}
        onConfirm={controller.confirmAction}
        pending={controller.isActing}
        destructive
      />
    </div>
  )
}
