import api from './axiosInstance';

export async function fetchProducts(params = {}) {
  const { data } = await api.get('/products', { params });
  return data;
}

export async function fetchProductBySlug(slug) {
  const { data } = await api.get(`/products/${slug}`);
  return data;
}

export async function searchProducts(q) {
  const { data } = await api.get('/products/search', { params: { q } });
  return data;
}

export async function fetchBrands() {
  const { data } = await api.get('/brands');
  return data;
}

export async function fetchCategories() {
  const { data } = await api.get('/categories');
  return data;
}
