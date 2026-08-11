import * as z from 'zod';

export const MIN_USERNAME_LENGTH = 3;
export const MIN_PASSWORD_LENGTH = 8;

export const credentialsSchema = z.object({
  password: z.string().min(MIN_PASSWORD_LENGTH),
  username: z.string().min(MIN_USERNAME_LENGTH),
});

export const authenticatedUserSchema = z.object({
  id: z.number(),
  username: z.string(),
});

export const authUserEnvelopeSchema = z.object({
  user: authenticatedUserSchema,
});

export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;

export type Credentials = z.infer<typeof credentialsSchema>;
