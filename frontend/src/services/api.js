import axios from 'axios';

const API_BASE = 'https://booking-court-app.onrender.com';

export const api = {
  courts: {
    list: () => axios.get(`${API_BASE}/courts`),
    create: (data) => axios.post(`${API_BASE}/courts`, data),
    delete: (id) => axios.delete(`${API_BASE}/courts/${id}`),
    update: (id, data) => axios.put(`${API_BASE}/courts/${id}`, data)
  },
  equipment: {
    list: () => axios.get(`${API_BASE}/equipment`),
    create: (data) => axios.post(`${API_BASE}/equipment`, data),
    update: (id, data) => axios.put(`${API_BASE}/equipment/${id}`, data),
    delete: (id) => axios.delete(`${API_BASE}/equipment/${id}`)
  },
  coaches: {
    list: () => axios.get(`${API_BASE}/coaches`),
    create: (data) => axios.post(`${API_BASE}/coaches`, data),
    update: (id, data) => axios.put(`${API_BASE}/coaches/${id}`, data),
    delete: (id) => axios.delete(`${API_BASE}/coaches/${id}`)
  },
  bookings: {
    list: () => axios.get(`${API_BASE}/bookings`),
    create: (data) => axios.post(`${API_BASE}/bookings`, data),
    checkAvailability: (data) => axios.post(`${API_BASE}/bookings/check-availability`, data),
    calculatePrice: (data) => axios.post(`${API_BASE}/bookings/calculate-price`, data)
  },
  pricing: {
    list: () => axios.get(`${API_BASE}/pricing`),
    create: (data) => axios.post(`${API_BASE}/pricing`, data),
    update: (id, data) => axios.put(`${API_BASE}/pricing/${id}`, data),
    delete: (id) => axios.delete(`${API_BASE}/pricing/${id}`)
  }
};
