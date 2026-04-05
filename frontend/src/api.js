import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tasks API
export const tasksAPI = {
  getAll: () => api.get('/tasks/'),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (task) => api.post('/tasks/', task),
  update: (id, task) => api.put(`/tasks/${id}`, task),
  delete: (id) => api.delete(`/tasks/${id}`),
  complete: (id) => api.post(`/tasks/${id}/complete`),
};

// Calendar API
export const calendarAPI = {
  getEvents: () => api.get('/calendar/events'),
  getTodayEvents: () => api.get('/calendar/today'),
  sync: () => api.post('/calendar/sync'),
};

// Agent API
export const agentAPI = {
  chat: (message) => api.post('/agent/chat', { message }),
  getSuggestions: () => api.get('/agent/suggestions'),
  createTaskFromSuggestion: (suggestion) => api.post('/agent/create-task-from-suggestion', suggestion),
};

// Analytics API
export const analyticsAPI = {
  getTodayStats: () => api.get('/analytics/today'),
  getWeeklyStats: () => api.get('/analytics/weekly'),
  getSummary: () => api.get('/analytics/summary'),
};

export default api;