const teamPhotoModules = import.meta.glob<string>('/src/assets/team/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

export function findTeamPhoto(fileName: string): string | undefined {
  const match = Object.entries(teamPhotoModules).find(([path]) => path.endsWith(`/${fileName}`))
  return match?.[1]
}
