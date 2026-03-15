export const SALT_ROUNDS = 12;

export const userProfileSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  nick: true,
  dateOfBirth: true,
  avatarUrl: true,
  locale: true,
  createdAt: true,
  updatedAt: true,
} as const;
