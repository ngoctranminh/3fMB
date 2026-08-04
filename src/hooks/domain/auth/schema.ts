import * as z from 'zod';

export const MIN_USERNAME_LENGTH = 3;
export const MIN_PASSWORD_LENGTH = 3;

export const credentialsSchema = z.object({
  password: z.string().min(MIN_PASSWORD_LENGTH),
  username: z.string().min(MIN_USERNAME_LENGTH),
});

export const authenticatedUserSchema = z.object({
  accessToken: z.string(),
  email: z.string(),
  firstName: z.string(),
  id: z.number(),
  image: z.string(),
  lastName: z.string(),
  refreshToken: z.string(),
  username: z.string(),
});

export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;

export type Credentials = z.infer<typeof credentialsSchema>;
