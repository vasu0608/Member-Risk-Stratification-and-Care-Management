
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const login = async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/token', formData);
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
};

export const predictDeterioration30d = (data) => api.post('/predict/deterioration/30d', data);
export const predictDeterioration60d = (data) => api.post('/predict/deterioration/60d', data);
export const predictDeterioration90d = (data) => api.post('/predict/deterioration/90d', data);
export const predictHeartDisease = (data) => api.post('/predict/heart-disease', data);
export const predictDiabetes = (data) => api.post('/predict/diabetes', data);
export const batchPredict = (patients) => api.post('/predict/batch', { patients });

export const saveMember = (data) => api.post('/members', data);
export const getMembers = () => api.get('/members');
export const seedData = () => api.post('/seed');
export const getLiveMonitoring = () => api.get('/monitoring/live');

export default api;
