import api from './axiosInstance';

export async function loginApi(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function registerApi(email, password, name, gender) {
  const { data } = await api.post('/auth/register', { email, password, name, gender });
  return data;
}

export async function getMeApi() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function updateProfileApi(fields) {
  const { data } = await api.put('/auth/profile', fields);
  return data;
}
