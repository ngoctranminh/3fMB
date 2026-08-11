import ky from 'ky';

const prefixUrl = `${process.env.API_URL ?? ''}/`;

const apiPrefixUrl = `${process.env.API_BASE_URL ?? ''}/`;

export const instance = ky.extend({
  headers: {
    Accept: 'application/json',
  },
  prefixUrl,
});

export const authInstance = ky.extend({
  credentials: 'include',
  headers: {
    Accept: 'application/json',
  },
  prefixUrl: apiPrefixUrl,
});

export const apiInstance = ky.extend({
  credentials: 'include',
  headers: {
    Accept: 'application/json',
  },
  prefixUrl: apiPrefixUrl,
});
