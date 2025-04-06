export const CONFIG = {
    API_URL: 'http://localhost:5000/api',
    CHART_COLORS: {
        primary: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        secondary: ['#FFB1C1', '#9BD0F5', '#FFE4B5', '#A5E0E0', '#C2B0FF']
    }
};

export async function fetchData(endpoint) {
    try {
        const response = await fetch(`${CONFIG.API_URL}/${endpoint}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
}

import { CONFIG, fetchData } from './config.js';

class SoilAnalysisVisualizer {
    constructor() {
        this.apiUrl = CONFIG.API_URL;
        // ...existing code...
    }
    
    async fetchSoilData() {
        const response = await fetch(`${this.apiUrl}${CONFIG.ENDPOINTS.SOIL_DATA}`);
        // ...existing code...
    }
    // ...existing code...
}