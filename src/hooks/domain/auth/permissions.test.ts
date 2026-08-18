import { canViewSauces } from './permissions';

describe('auth permissions', () => {
  it.each(['manhtu3f', 'ngoc3f', 'hieu3f'])(
    'allows %s to view sauce recipes',
    (username) => {
      expect(canViewSauces(username)).toBe(true);
    },
  );

  it.each(['other3f', 'Manhtu3f', '', undefined])(
    'does not allow %s to view sauce recipes',
    (username) => {
      expect(canViewSauces(username)).toBe(false);
    },
  );
});
