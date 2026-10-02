import { PageHeader } from '@/components/common/PageHeader'
import { ChangePasswordForm } from '@/components/modules/profile/ChangePasswordForm'
import { ProfileDetailsForm } from '@/components/modules/profile/ProfileDetailsForm'
import { SessionsCard } from '@/components/modules/profile/SessionsCard'
import { PROFILE_TEXTS } from '@/constants/authTexts'
import { useProfileController } from '@/controllers/useProfileController'

export default function ProfileView() {
  const { roleLabel, profile, password, logoutAll } = useProfileController()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader title={PROFILE_TEXTS.title} description={PROFILE_TEXTS.description} />
      <ProfileDetailsForm
        form={profile.form}
        onSubmit={profile.onSubmit}
        isSubmitting={profile.isSubmitting}
        serverError={profile.serverError}
        canSubmit={profile.canSubmit}
        roleLabel={roleLabel}
      />
      <ChangePasswordForm
        form={password.form}
        onSubmit={password.onSubmit}
        isSubmitting={password.isSubmitting}
        serverError={password.serverError}
      />
      <SessionsCard
        isConfirmOpen={logoutAll.confirmation.isOpen}
        onOpenConfirm={logoutAll.confirmation.open}
        onConfirmOpenChange={logoutAll.confirmation.setIsOpen}
        onConfirm={logoutAll.confirm}
        isPending={logoutAll.isPending}
      />
    </div>
  )
}
