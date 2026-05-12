import api from './axiosInstance';
export const fetchNotifications = () => api.get('/notifications').then(r => r.data);
export const subscribeStockAlert = (productId) => api.post('/auth/stock-alerts', { productId }).then(r => r.data);
export const unsubscribeStockAlert = (productId) => api.delete(`/auth/stock-alerts/${productId}`).then(r => r.data);
export const fetchMyAlerts = () => api.get('/auth/stock-alerts').then(r => r.data);
