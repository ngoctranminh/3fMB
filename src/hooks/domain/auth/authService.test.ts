import { authInstance } from '@/services/instance';

import { AuthServices } from './authService';

jest.mock('@/services/instance', () => ({
  authInstance: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedAuthInstance = jest.mocked(authInstance);

describe('AuthServices', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('changes the password through the authenticated endpoint', async () => {
    mockedAuthInstance.post.mockResolvedValue({} as never);

    await expect(
      AuthServices.changePassword({
        currentPassword: 'old-password',
        newPassword: 'new-password',
      }),
    ).resolves.toBeUndefined();

    expect(mockedAuthInstance.post).toHaveBeenCalledWith(
      'api/auth/change-password',
      {
        json: {
          current_password: 'old-password',
          new_password: 'new-password',
        },
      },
    );
  });

  it('logs in against the warehouse server and unwraps the user', async () => {
    mockedAuthInstance.post.mockReturnValue({
      json: jest.fn().mockResolvedValue({
        user: { id: 1, username: 'manhtu3f' },
      }),
    } as never);

    await expect(
      AuthServices.login({ password: 'password123', username: 'manhtu3f' }),
    ).resolves.toEqual({ id: 1, username: 'manhtu3f' });

    expect(mockedAuthInstance.post).toHaveBeenCalledWith('api/auth/login', {
      json: { password: 'password123', username: 'manhtu3f' },
    });
  });

  it('reads the current cookie session', async () => {
    mockedAuthInstance.get.mockReturnValue({
      json: jest.fn().mockResolvedValue({
        user: { id: 2, username: 'ngoc3f' },
      }),
    } as never);

    await expect(AuthServices.getCurrentUser()).resolves.toEqual({
      id: 2,
      username: 'ngoc3f',
    });
    expect(mockedAuthInstance.get).toHaveBeenCalledWith('api/auth/me');
  });

  it('logs out through the server', async () => {
    mockedAuthInstance.post.mockResolvedValue({} as never);

    await expect(AuthServices.logout()).resolves.toBeUndefined();
    expect(mockedAuthInstance.post).toHaveBeenCalledWith('api/auth/logout');
  });
});
