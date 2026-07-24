import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: true,
})

// Listings
export const getAllListings = () => API.get('/listings')
export const getListing = (id) => API.get(`/listings/${id}`)
export const createListing = (formData) => API.post('/listings', formData)
export const updateListing = (id, formData) => API.put(`/listings/${id}`, formData)
export const deleteListing = (id) => API.delete(`/listings/${id}`)

// Reviews
export const createReview = (listingId, data) => API.post(`/listings/${listingId}/reviews`, data)
export const deleteReview = (listingId, reviewId) => API.delete(`/listings/${listingId}/reviews/${reviewId}`)

// Auth
export const signup = (data) => API.post('/users/signup', data)
export const login = (data) => API.post('/users/login', data)
export const logout = () => API.post('/users/logout')
export const getMe = () => API.get('/users/me')
export const generateDescription = (data) => API.post('/ai/generate-description', data)
export default API