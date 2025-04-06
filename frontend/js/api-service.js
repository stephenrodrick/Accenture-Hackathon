class DataService {
    constructor() {
        this.baseUrl = 'http://localhost:5000/api';
    }

    async fetchData(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    async getFarmingData() {
        return this.fetchData('farming-data');
    }

    async getMarketData() {
        return this.fetchData('market-data');
    }

    async getSoilData() {
        return this.fetchData('soil-data');
    }

    async getRecommendations(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.fetchData(`recommendations?${queryParams}`);
    }

    async getHistoricalData(dateRange = {}) {
        const queryParams = new URLSearchParams(dateRange).toString();
        return this.fetchData(`historical-data?${queryParams}`);
    }

    async getWeatherData() {
        return this.fetchData('weather-data');
    }

    async getCropAnalysis() {
        return this.fetchData('crop-analysis');
    }
}

export const dataService = new DataService();

import { dataService } from './api-service.js';

class ConnectionChecker {
    constructor() {
        this.endpoints = [
            'farming-data',
            'market-data',
            'soil-data',
            'recommendations',
            'historical-data',
            'weather-data',
            'crop-analysis'
        ];
    }

    async checkAllConnections() {
        console.log('Checking all API connections...');
        
        for (const endpoint of this.endpoints) {
            try {
                const start = performance.now();
                await dataService.fetchData(endpoint);
                const duration = (performance.now() - start).toFixed(2);
                
                console.log(`✅ ${endpoint}: Connected (${duration}ms)`);
            } catch (error) {
                console.error(`❌ ${endpoint}: Failed - ${error.message}`);
            }
        }
    }
}

// Run connection check when added to any page
document.addEventListener('DOMContentLoaded', () => {
    const checker = new ConnectionChecker();
    checker.checkAllConnections();
});