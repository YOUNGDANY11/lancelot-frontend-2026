export const queryKeys = {
  users: {
    all: ['users'] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
  },
}
