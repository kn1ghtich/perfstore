import api from './axiosInstance';

export async function fetchReviews(productId) {
  const { data } = await api.get(`/products/${productId}/reviews`);
  return data;
}

export async function createReview(productId, review) {
  const { data } = await api.post(`/products/${productId}/reviews`, review);
  return data;
}

export async function deleteReview(reviewId) {
  const { data } = await api.delete(`/reviews/${reviewId}`);
  return data;
}
