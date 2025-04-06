import { dataService } from './api-service.js';
// Constants
const API_BASE_URL = 'http://localhost:5000/api';

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