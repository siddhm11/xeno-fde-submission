import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Env variable in real app
    headers: {
        'Content-Type': 'application/json',
    },
});

export const connectStore = (data) => api.post('/shopify/connect', data);
export const syncData = (tenantId) => api.post(`/sync/${tenantId}`);
export const getStats = (tenantId) => api.get(`/insights/stats?tenantId=${tenantId}`);
export const getSalesOverTime = (tenantId) => api.get(`/insights/sales-over-time?tenantId=${tenantId}`);
export const getTopCustomers = (tenantId) => api.get(`/insights/top-customers?tenantId=${tenantId}`);

export default api;
