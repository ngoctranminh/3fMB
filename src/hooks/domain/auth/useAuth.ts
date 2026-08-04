import type { Credentials } from './schema';

import { useMutation } from '@tanstack/react-query';

import { AuthServices } from './authService';

const useLoginMutation = () =>
  useMutation({
    mutationFn: (credentials: Credentials) => AuthServices.login(credentials),
  });

export const useAuth = () => {
  return { useLoginMutation };
};
