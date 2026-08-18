const SAUCE_VIEWER_USERNAMES = new Set(['hieu3f', 'manhtu3f', 'ngoc3f']);

export const canViewSauces = (username?: null | string) =>
  username === undefined || username === null
    ? false
    : SAUCE_VIEWER_USERNAMES.has(username);
