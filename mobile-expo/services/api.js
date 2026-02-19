import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/server';

// Create axios instance with auto-detected URL
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response) {
            // Server responded with error
            throw new Error(error.response.data.error || 'Server error');
        } else if (error.request) {
            // Request made but no response
            throw new Error('Network error. Please check your connection.');
        } else {
            throw new Error('An unexpected error occurred');
        }
    }
);

// API methods
export const stallsAPI = {
    // Get nearby stalls
    getNearby: (lat, long, radius = 1000, openOnly = false) => {
        return apiClient.get('/stalls/nearby', {
            params: { lat, long, radius, open_only: openOnly },
        });
    },

    // Get stall details
    getDetails: (stallId) => {
        return apiClient.get(`/stalls/${stallId}`);
    },

    // Submit review
    submitReview: (reviewData) => {
        return apiClient.post('/stalls/reviews', reviewData);
    },

    // Search stalls
    search: (query, filters = {}) => {
        return apiClient.get('/stalls/search', {
            params: { q: query, ...filters },
        });
    },
};

export const ownerAPI = {
    // Update stall status
    updateStatus: (stallId, ownerId, isOpen, location = null) => {
        return apiClient.post('/owner/status', {
            stall_id: stallId,
            owner_id: ownerId,
            is_open: isOpen,
            location,
        });
    },

    // Update menu
    updateMenu: (stallId, ownerId, menuText) => {
        return apiClient.put('/owner/menu', {
            stall_id: stallId,
            owner_id: ownerId,
            menu_text: menuText,
        });
    },

    // Upload hygiene proof
    uploadHygieneProof: async (stallId, ownerId, photoUri, photoType) => {
        const formData = new FormData();
        formData.append('stall_id', stallId);
        formData.append('owner_id', ownerId);
        formData.append('photo_type', photoType);

        // Extract filename from URI
        const filename = photoUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('photo', {
            uri: photoUri,
            name: filename,
            type,
        });

        return apiClient.post('/owner/hygiene-proof', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Get owner's stalls
    getStalls: (ownerId) => {
        return apiClient.get(`/owner/stalls/${ownerId}`);
    },
};

export const authAPI = {
    // Request OTP
    requestOTP: (phoneNumber) => {
        return apiClient.post('/auth/request-otp', { phone_number: phoneNumber });
    },

    // Verify OTP
    verifyOTP: async (phoneNumber, otp, name = null) => {
        const response = await apiClient.post('/auth/verify-otp', {
            phone_number: phoneNumber,
            otp,
            name,
        });

        // Store token
        if (response.token) {
            await AsyncStorage.setItem('authToken', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    },

    // Logout
    logout: async () => {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser: async () => {
        const userJson = await AsyncStorage.getItem('user');
        return userJson ? JSON.parse(userJson) : null;
    },
};

export default {
    stalls: stallsAPI,
    owner: ownerAPI,
    auth: authAPI,
};
