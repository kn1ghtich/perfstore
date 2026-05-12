import api from './axiosInstance';

export async function createOrderApi(payload) {
  const { data } = await api.post('/orders', payload);
  return data;
}

export async function getOrdersApi() {
  const { data } = await api.get('/orders');
  return data;
}

export async function getOrderApi(id) {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}
