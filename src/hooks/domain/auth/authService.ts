import type { Credentials } from './schema';

import { HTTPError } from 'ky';

import { authInstance } from '@/services/instance';

import { authenticatedUserSchema } from './schema';

export const enum AuthErrorKind {
  invalidCredentials = 'invalidCredentials',
  network = 'network',
}

export class AuthError extends Error {
  readonly kind: AuthErrorKind;

  constructor(kind: AuthErrorKind) {
    super(kind);
    this.kind = kind;
    this.name = 'AuthError';
  }
}

const UNAUTHORIZED = 401;
const CLIENT_ERROR_FLOOR = 400;
const CLIENT_ERROR_CEILING = 500;

export const AuthServices = {
  login: async (credentials: Credentials) => {
    try {
      const response = await authInstance
        .post('auth/login', { json: credentials })
        .json();

      return authenticatedUserSchema.parse(response);
    } catch (error) {
      if (error instanceof HTTPError) {
        const { status } = error.response;

        if (
          status === UNAUTHORIZED ||
          (status >= CLIENT_ERROR_FLOOR && status < CLIENT_ERROR_CEILING)
        ) {
          throw new AuthError(AuthErrorKind.invalidCredentials);
        }
      }

      throw new AuthError(AuthErrorKind.network);
    }
  },
};
