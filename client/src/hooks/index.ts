import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { AxiosResponse, AxiosError } from "axios";
import { api } from "../api";

// Generic Types
interface QueryOptions<T> {
  key: string | string[];
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
}

interface MutationOptions<T> {
  key: string | string[];
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
}

// Hook for fetching all entities
export function useGetAll<T>(
  url: string,
  options: QueryOptions<T[]>,
  accessToken?: string
): UseQueryResult<AxiosResponse<T>, AxiosError> {
  return useQuery<AxiosResponse<T>, AxiosError>({
    queryKey: [url, options.key],
    queryFn: () =>
      api.get<T>(url, {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      }),
    enabled: options.enabled,
  });
}

// Hook for fetching a single entity
export function useGetOne<T>(
  url: string,
  options: QueryOptions<T>,
  accessToken?: string
): UseQueryResult<AxiosResponse<T>, AxiosError> {
  return useQuery<AxiosResponse<T>, AxiosError>({
    queryKey: [url, options.key],
    queryFn: () =>
      api.get<T>(url, {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      }),
    enabled: options.enabled,
  });
}

// Hook for creating an entity
export function useCreate<T, U>(
  url: string,
  options: MutationOptions<T>,
  accessToken?: string
): UseMutationResult<AxiosResponse<T>, AxiosError, U> {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<T>, AxiosError, U>({
    mutationFn: (data: U) =>
      api.post<T>(url, data, {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [options.key] });
      options.onSuccess?.(data.data);
    },
    onError: options.onError,
  });
}

// Hook for updating an entity
export function useUpdate<T, U>(
  url: string,
  options: MutationOptions<T>,
  accessToken?: string
): UseMutationResult<AxiosResponse<T>, AxiosError, U> {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<T>, AxiosError, U>({
    mutationFn: (data: U) =>
      api.put<T>(url, data, {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [options.key] });
      options.onSuccess?.(data.data);
    },
    onError: options.onError,
  });
}

// Hook for deleting an entity
export function useDelete<T>(
  url: string,
  options: MutationOptions<T>,
  accessToken?: string
): UseMutationResult<AxiosResponse<T>, AxiosError, void> {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<T>, AxiosError, void>({
    mutationFn: () =>
      api.delete<T>(url, {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [options.key] });
      options.onSuccess?.(data.data);
    },
    onError: options.onError,
  });
}
