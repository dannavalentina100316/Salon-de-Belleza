
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const mensaje =
      error.response?.data?.mensaje ||
      error.response?.data?.msg ||
      'No se pudo conectar con el servidor.'

    return Promise.reject(new Error(mensaje))
  },
)

export default api