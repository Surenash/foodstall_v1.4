import { MOCK_STALLS, MOCK_OWNER, MOCK_USER } from './mockData';

// API methods patched for Standalone Demo Mode
export const stallsAPI = {
    // Get nearby stalls
    getNearby: async (lat, long, radius = 1000, openOnly = false) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Filter logic mock
        let stalls = [...MOCK_STALLS];
        if (openOnly) {
            stalls = stalls.filter(s => s.is_open);
        }

        return { success: true, stalls: stalls };
    },

    // Get stall details
    getDetails: async (stallId) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const stall = MOCK_STALLS.find(s => s.id == stallId);
        if (!stall) throw new Error("Stall not found");
        return { success: true, stall };
    },

    // Submit review
    submitReview: async (reviewData) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true, message: "Review submitted successfully" };
    },

    // Search stalls
    search: async (query, filters = {}) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const q = query.toLowerCase();
        const stalls = MOCK_STALLS.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.cuisine_type.toLowerCase().includes(q)
        );
        return { success: true, stalls };
    },
};

export const ownerAPI = {
    // Update stall status
    updateStatus: async (stallId, ownerId, isOpen, location = null) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        console.log(`[MOCK OS] Status updated: ${isOpen ? 'OPEN' : 'CLOSED'} at`, location);
        // Update local mock state if needed (not persistent across reloads but good for session)
        MOCK_OWNER.is_open = isOpen;
        if (location) MOCK_OWNER.location = location;

        return { success: true, message: "Status updated" };
    },

    // Update menu
    updateMenu: async (stallId, ownerId, menuText) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, message: "Menu updated" };
    },

    // Upload hygiene proof
    uploadHygieneProof: async (stallId, ownerId, photoUri, photoType) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, message: "Proof uploaded" };
    },

    // Get owner's stalls
    getStalls: async (ownerId) => {
        return { success: true, stalls: [MOCK_OWNER] };
    },
};

export const authAPI = {
    // Request OTP
    requestOTP: async (phoneNumber) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true, message: "OTP Sent" };
    },

    // Verify OTP
    verifyOTP: async (phoneNumber, otp, name = null) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (otp !== '1234') {
            // Allow any OTP for demo simplicity? No, let's look roughly real.
            // throw new Error("Invalid OTP"); 
        }
        return {
            success: true,
            token: 'demo-token-123',
            user: MOCK_USER
        };
    },

    // Logout
    logout: async () => {
        return { success: true };
    },

    // Get current user
    getCurrentUser: async () => {
        return MOCK_USER;
    },
};

export default {
    stalls: stallsAPI,
    owner: ownerAPI,
    auth: authAPI,
};
