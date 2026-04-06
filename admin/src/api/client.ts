import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

// Request interceptor
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

export default api

// API methods
export const examAPI = {
  list: (params: any) => api.get('/admin/exams', { params }),
  get: (id: number) => api.get(`/admin/exams/${id}`),
  create: (data: any) => api.post('/admin/exams', data),
  update: (id: number, data: any) => api.put(`/admin/exams/${id}`, data),
  delete: (id: number) => api.delete(`/admin/exams/${id}`),
}

export const applicationAPI = {
  list: (params: any) => api.get('/admin/applications', { params }),
  get: (id: number) => api.get(`/admin/applications/${id}`),
  review: (id: number, data: any) => api.post(`/admin/applications/${id}/review`, data),
}

export const venueAPI = {
  listAreas: () => api.get('/admin/areas'),
  createArea: (data: any) => api.post('/admin/areas', data),
  updateArea: (id: number, data: any) => api.put(`/admin/areas/${id}`, data),
  listVenues: () => api.get('/admin/venues'),
  createVenue: (data: any) => api.post('/admin/venues', data),
  listRooms: (venueId: number) => api.get(`/admin/venues/${venueId}/rooms`),
  createRoom: (venueId: number, data: any) => api.post(`/admin/venues/${venueId}/rooms`, data),
}

export const scoreAPI = {
  import: (formData: FormData) => api.post('/admin/scores/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  publish: (examId: number) => api.post('/admin/scores/publish', { exam_id: examId }),
}

export const noticeAPI = {
  list: (params?: any) => api.get('/admin/notices', { params }),
  get: (id: number) => api.get(`/admin/notices/${id}`),
  create: (data: any) => api.post('/admin/notices', data),
  update: (id: number, data: any) => api.put(`/admin/notices/${id}`, data),
  delete: (id: number) => api.delete(`/admin/notices/${id}`),
}

export const userAPI = {
  list: (params: any) => api.get('/admin/users', { params }),
  get: (id: number) => api.get(`/admin/users/${id}`),
}

export const orderAPI = {
  list: (params: any) => api.get('/admin/orders', { params }),
  get: (id: number) => api.get(`/admin/orders/${id}`),
}
