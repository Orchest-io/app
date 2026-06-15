import client from './client';

export const startCheckout = async (): Promise<{ url: string }> => {
  const response = await client.post('/subscription/checkout');
  return response.data;
};

export const openPortal = async (): Promise<{ url: string }> => {
  const response = await client.post('/subscription/portal');
  return response.data;
};
