import { useQuery, useMutation } from '@tanstack/react-query';
import { getSubscriptionStatus } from '../api/ai.api';
import { startCheckout, openPortal } from '../api/subscription.api';

export const useSubscriptionStatus = () => {
  return useQuery({
    queryKey: ['subscription-status'],
    queryFn: getSubscriptionStatus,
    staleTime: 1000 * 60, // 1 minute
    retry: 1,
  });
};

export const useStartCheckout = () => {
  return useMutation({
    mutationFn: startCheckout,
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
};

export const useOpenPortal = () => {
  return useMutation({
    mutationFn: openPortal,
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
};
