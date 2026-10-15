import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DATA_POLICY, DATA_POLICY_CONSENT } from '@/constants/dataPolicy'
import { APP_ROUTES } from '@/constants/routes'
import { formatDateTime } from '@/utils/formatDate'

export function DataPolicyCard({ acceptedAt }: { acceptedAt?: string | null }) {
  const acceptedLabel = formatDateTime(acceptedAt)

  return (
    <Card className="glass-subtle">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
          {DATA_POLICY.title}
        </CardTitle>
        <CardDescription>
          {acceptedLabel ? DATA_POLICY_CONSENT.acceptedOn(acceptedLabel) : DATA_POLICY.version}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to={APP_ROUTES.dataPolicy} target="_blank" rel="noopener">
            {DATA_POLICY_CONSENT.readPolicy}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
