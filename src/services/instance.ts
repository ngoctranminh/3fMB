import ky from 'ky';

const toPrefixUrl = (value: string | undefined) =>
  `${(value ?? '').replace(/\/+$/, '')}/`;

const prefixUrl = toPrefixUrl(process.env.API_URL);

const apiPrefixUrl = toPrefixUrl(process.env.API_BASE_URL);

export const resolveApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiPrefixUrl}${path.replace(/^\/+/, '')}`;
};

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
