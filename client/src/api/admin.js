import axios from 'axios';

const api = axios.create({ baseURL: '/api/admin' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Products
export const adminGetProducts   = (params)     => api.get('/products', { params }).then((r) => r.data);
export const adminGetProduct    = (id)          => api.get(`/products/${id}`).then((r) => r.data);
export const adminCreateProduct = (data)        => api.post('/products', data).then((r) => r.data);
export const adminUpdateProduct = (id, data)    => api.put(`/products/${id}`, data).then((r) => r.data);
export const adminDeleteProduct = (id)          => api.delete(`/products/${id}`).then((r) => r.data);

// Users
export const adminGetUsers = (params) => api.get('/users', { params }).then((r) => r.data);
export const adminGetUser  = (id)     => api.get(`/users/${id}`).then((r) => r.data);
export const adminUpdateUserRole = (id, role) => api.patch(`/users/${id}/role`, { role }).then((r) => r.data);

// Orders
export const adminGetOrders = (params) => api.get('/orders', { params }).then((r) => r.data);
export const adminUpdateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status }).then((r) => r.data);

// Stats
export const adminGetStats = () => api.get('/stats').then((r) => r.data);

// Dictionaries
export const adminGetBrands     = () => api.get('/brands').then((r) => r.data);
export const adminGetCategories = () => api.get('/categories').then((r) => r.data);

// Stores
export const adminGetStores    = ()           => api.get('/stores').then((r) => r.data);
export const adminGetStore     = (id)         => api.get(`/stores/${id}`).then((r) => r.data);
export const adminCreateStore  = (data)       => api.post('/stores', data).then((r) => r.data);
export const adminUpdateStore  = (id, data)   => api.put(`/stores/${id}`, data).then((r) => r.data);
export const adminDeleteStore  = (id)         => api.delete(`/stores/${id}`).then((r) => r.data);

// Store inventory
export const adminAddStoreProduct    = (storeId, data)                => api.post(`/stores/${storeId}/inventory`, data).then((r) => r.data);
export const adminUpdateStoreQty     = (storeId, productId, quantity) => api.patch(`/stores/${storeId}/inventory/${productId}`, { quantity }).then((r) => r.data);
export const adminRemoveStoreProduct = (storeId, productId)           => api.delete(`/stores/${storeId}/inventory/${productId}`).then((r) => r.data);

// Notifications
export const adminGetNotifications    = (params) => api.get('/notifications', { params }).then(r => r.data);
export const adminCreateNotification  = (data)   => api.post('/notifications', data).then(r => r.data);
export const adminDeleteNotification  = (id)     => api.delete(`/notifications/${id}`).then(r => r.data);

// Slides (home carousel)
export const adminGetSlides       = ()          => api.get('/slides').then(r => r.data);
export const adminCreateSlide     = (data)      => api.post('/slides', data).then(r => r.data);
export const adminUpdateSlide     = (id, data)  => api.put(`/slides/${id}`, data).then(r => r.data);
export const adminDeleteSlide     = (id)        => api.delete(`/slides/${id}`).then(r => r.data);
export const adminUploadSlideImage = (id, base64) => api.post(`/slides/${id}/image`, { image_base64: base64 }).then(r => r.data);
export const adminDeleteSlideImage = (id)       => api.delete(`/slides/${id}/image`).then(r => r.data);
