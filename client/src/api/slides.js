import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const fetchSlides = () => api.get('/slides').then((r) => r.data.slides);
