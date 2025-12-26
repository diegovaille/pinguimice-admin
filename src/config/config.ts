// API Configuration

export const config = {
    // API Base URL - defaults to localhost for development
    // Can be overridden with VITE_API_BASE_URL environment variable
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',

    // API prefix for all endpoints
    apiPrefix: '/api/pinguim-admin',

    // Get full API URL
    getApiUrl: (endpoint: string) => {
        const baseUrl = config.apiBaseUrl;
        const prefix = config.apiPrefix;
        // Remove leading slash from endpoint if present
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        return `${baseUrl}${prefix}/${cleanEndpoint}`;
    }
};
