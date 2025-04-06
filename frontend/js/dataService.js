export class DataService {
    static async getFarmData() {
        try {
            const response = await fetch('http://localhost:5000/api/farm-data');
            return await response.json();
        } catch (error) {
            console.error('Error fetching farm data:', error);
            throw error;
        }
    }

    static async getMarketData() {
        try {
            const response = await fetch('http://localhost:5000/api/market-data');
            return await response.json();
        } catch (error) {
            console.error('Error fetching market data:', error);
            throw error;
        }
    }
}