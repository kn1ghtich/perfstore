import api from './axiosInstance';

export async function fetchStores() {
  const { data } = await api.get('/stores');
  return data;
}

export async function fetchStoresByProduct(productId) {
  const { data } = await api.get(`/stores/product/${productId}`);
  return data;
}
