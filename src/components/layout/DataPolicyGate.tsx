import { Loader2, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { DATA_POLICY_CONSENT } from '@/constants/dataPolicy'
import { APP_ROUTES } from '@/constants/routes'
import { useDataPolicyGateController } from '@/controllers/useDataPolicyGateController'

export function DataPolicyGate() {
  const controller = useDataPolicyGateController()

  return (
    <AlertDialog open={controller.isPending}>
      <AlertDialogContent className="glass sm:max-w-lg">
        <AlertDialogHeader>
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </span>
          <AlertDialogTitle className="text-lg">{DATA_POLICY_CONSENT.gateTitle}</AlertDialogTitle>
          <AlertDialogDescription>{DATA_POLICY_CONSENT.gateDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
          {DATA_POLICY_CONSENT.gateSummary.map((item) => (
            <li key={item} className="text-pretty">
              {item}
            </li>
          ))}
        </ul>
        <Link
          to={APP_ROUTES.dataPolicy}
          target="_blank"
          rel="noopener"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {DATA_POLICY_CONSENT.readPolicy}
        </Link>
        <AlertDialogFooter className="bg-transparent">
          <Button variant="ghost" onClick={controller.signOut} disabled={controller.isAccepting}>
            {DATA_POLICY_CONSENT.signOut}
          </Button>
          <Button
            onClick={controller.accept}
            disabled={controller.isAccepting}
            aria-busy={controller.isAccepting}
          >
            {controller.isAccepting && <Loader2 className="animate-spin" aria-hidden="true" />}
            {controller.isAccepting ? DATA_POLICY_CONSENT.accepting : DATA_POLICY_CONSENT.accept}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
