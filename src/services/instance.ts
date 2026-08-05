import ky from 'ky';

const prefixUrl = `${process.env.API_URL ?? ''}/`;

const authPrefixUrl = `${process.env.AUTH_API_URL ?? ''}/`;

const apiPrefixUrl = `${process.env.API_BASE_URL ?? ''}/`;

export const instance = ky.extend({
  headers: {
    Accept: 'application/json',
  },
  prefixUrl,
});

export const authInstance = ky.extend({
  headers: {
    Accept: 'application/json',
  },
  prefixUrl: authPrefixUrl,
});

export const apiInstance = ky.extend({
  headers: {
    Accept: 'application/json',
  },
  prefixUrl: apiPrefixUrl,
});
