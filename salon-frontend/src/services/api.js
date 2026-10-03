import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3200/api',
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('salon-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.mensaje
      || error.response?.data?.msg
      || error.message
      || 'No se pudo conectar con el servidor.'
    return Promise.reject(new Error(message))
  },
)

export default api
