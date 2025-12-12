import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const session = localStorage.getItem('session');
    if (session) {
        const { access_token } = JSON.parse(session);
        if (access_token) {
            config.headers.Authorization = `Bearer ${access_token}`;
        }
    }
    return config;
}, (error) => Promise.reject(error));

export const auth = {
    signUp: async (credentials: any) => {
        try {
            const response = await api.post('/auth/signup', credentials);
            return { data: response.data.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error || { message: 'Signup failed' } };
        }
    },
    signInWithPassword: async (credentials: any) => {
        try {
            const response = await api.post('/auth/token', credentials);
            return { data: response.data.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error || { message: 'Signin failed' } };
        }
    },
    getUser: async () => {
        try {
            const response = await api.get('/auth/user');
            return { data: response.data.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error || { message: 'Failed to get user' } };
        }
    },
    signOut: async () => {
        localStorage.removeItem('session');
        return { error: null };
    }
};

export const links = {
    create: async (linkData: any) => {
        // Map frontend expectation (insert returns data array) to backend response
        try {
            const response = await api.post('/links', linkData);
            return { data: response.data.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error || { message: 'Failed to create link' } };
        }
    },
    generateCode: async () => {
        try {
            const response = await api.get('/links/generate-code');
            return { data: response.data.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error };
        }
    },
    getByCode: async (code: string) => {
        try {
            const response = await api.get(`/links/${code}`);
            return { data: response.data.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error };
        }
    },
    getAll: async () => {
        try {
            const response = await api.get('/links');
            return { data: response.data.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error };
        }
    },
    incrementClicks: async (id: string) => {
        return api.post(`/links/${id}/click`);
    },
    update: async (id: string, updates: any) => {
        try {
            const response = await api.patch(`/links/${id}`, updates);
            return { error: null };
        } catch (error: any) {
            return { error: error.response?.data?.error };
        }
    },
    delete: async (id: string) => {
        try {
            const response = await api.delete(`/links/${id}`);
            return { error: null };
        } catch (error: any) {
            return { error: error.response?.data?.error };
        }
    }
};

export const ads = {
    getRandom: async () => {
        try {
            const response = await api.get('/advertisements/random');
            return { data: response.data.data ? [response.data.data] : [], error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error };
        }
    },
    getByUser: async () => {
        try {
            const response = await api.get('/advertisements');
            return { data: response.data.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error };
        }
    },
    create: async (formData: FormData) => {
        try {
            const response = await api.post('/advertisements', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return { data: response.data.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error };
        }
    },
    toggleStatus: async (id: string) => {
        try {
            const response = await api.patch(`/advertisements/${id}/toggle`);
            return { error: null };
        } catch (error: any) {
            return { error: error.response?.data?.error };
        }
    },
    delete: async (id: string) => {
        try {
            const response = await api.delete(`/advertisements/${id}`);
            return { error: null };
        } catch (error: any) {
            return { error: error.response?.data?.error };
        }
    }
};

export const reports = {
    create: async (reportData: any) => {
        try {
            const response = await api.post('/reports', reportData);
            return { data: response.data.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error };
        }
    },
    getAll: async () => {
        try {
            const response = await api.get('/reports');
            return { data: response.data.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error };
        }
    },
    update: async (id: string, updates: any) => {
        try {
            const response = await api.patch(`/reports/${id}`, updates);
            return { error: null };
        } catch (error: any) {
            return { error: error.response?.data?.error };
        }
    }
};

export const users = {
    getAll: async () => {
        try {
            const response = await api.get('/users');
            return { data: response.data.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error };
        }
    },
    updateStatus: async (id: string, status: string) => {
        try {
            const response = await api.patch(`/users/${id}`, { status });
            return { error: null };
        } catch (error: any) {
            return { error: error.response?.data?.error };
        }
    },
    updateRole: async (id: string, role: string) => {
        try {
            const response = await api.patch(`/users/${id}`, { role });
            return { error: null };
        } catch (error: any) {
            return { error: error.response?.data?.error };
        }
    }
};

export const sessions = {
    track: async (sessionData: any) => {
        try {
            const response = await api.post('/sessions/track', sessionData);
            return { data: response.data.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error };
        }
    },
    getAll: async () => {
        try {
            const response = await api.get('/sessions');
            return { data: response.data.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error };
        }
    },
    getByUser: async (userId: string) => {
        try {
            const response = await api.get(`/sessions/user/${userId}`);
            return { data: response.data.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.response?.data?.error };
        }
    }
};

export default api;
