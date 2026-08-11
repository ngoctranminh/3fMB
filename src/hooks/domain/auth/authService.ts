import type { Credentials } from './schema';

import { HTTPError } from 'ky';

import { authInstance } from '@/services/instance';

import { authUserEnvelopeSchema } from './schema';

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
  getCurrentUser: async () => {
    try {
      const response = await authInstance.get('api/auth/me').json();
      return authUserEnvelopeSchema.parse(response).user;
    } catch (error) {
      if (
        error instanceof HTTPError &&
        error.response.status === UNAUTHORIZED
      ) {
        return false;
      }

      throw new AuthError(AuthErrorKind.network);
    }
  },

  login: async (credentials: Credentials) => {
    try {
      const response = await authInstance
        .post('api/auth/login', { json: credentials })
        .json();

      return authUserEnvelopeSchema.parse(response).user;
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

  logout: async () => {
    try {
      await authInstance.post('api/auth/logout');
    } catch (error) {
      // Phiên hết hạn đồng nghĩa người dùng đã đăng xuất.
      if (
        error instanceof HTTPError &&
        error.response.status === UNAUTHORIZED
      ) {
        return;
      }

      throw new AuthError(AuthErrorKind.network);
    }
  },
};
