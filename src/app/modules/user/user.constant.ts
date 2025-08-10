export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user',
  SUPERVISOR: 'supervisor',
} as const;

export const userRole = Object.values(USER_ROLE);
