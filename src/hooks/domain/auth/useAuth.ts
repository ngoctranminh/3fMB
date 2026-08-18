import type { ChangePasswordInput, Credentials } from './schema';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AuthServices } from './authService';

const useChangePasswordMutation = () =>
  useMutation({
    mutationFn: (passwords: ChangePasswordInput) =>
      AuthServices.changePassword(passwords),
  });

const useLoginMutation = () =>
  useMutation({
    mutationFn: (credentials: Credentials) => AuthServices.login(credentials),
  });

const useCurrentUserQuery = () =>
  useQuery({
    queryFn: AuthServices.getCurrentUser,
    queryKey: ['auth', 'currentUser'],
  });

export const useAuth = () => {
  const client = useQueryClient();

  const useLogoutMutation = () =>
    useMutation({
      mutationFn: AuthServices.logout,
      onSuccess: () => {
        client.removeQueries();
      },
    });

  return {
    useChangePasswordMutation,
    useCurrentUserQuery,
    useLoginMutation,
    useLogoutMutation,
  };
};
