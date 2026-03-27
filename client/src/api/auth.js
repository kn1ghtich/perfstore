import api from './axiosInstance';

export async function loginApi(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function registerApi(email, password, name) {
  const { data } = await api.post('/auth/register', { email, password, name });
  return data;
}

export async function getMeApi() {
  const { data } = await api.get('/auth/me');
  return data;
}
