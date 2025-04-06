import { apiService } from './api-service.js';
import { farmDataService } from './data-service.js';
import { FarmDataVisualizer } from './data-visualization.js';
import { CONFIG, fetchData } from './config.js';

const API_BASE_URL = 'http://localhost:5000/api';

console.log('Connecting to server at:', API_BASE_URL);

// Add this function to verify server connection
async function verifyServerConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health-check`);
        if (response.ok) {
            console.log('Successfully connected to server on port 5501');
            return true;
        }
        throw new Error('Server connection failed');
    } catch (error) {
        console.error('Server connection error:', error);
        return false;
    }
}

// Initialize charts and data when page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing dashboard...');
    
    // Check server connection first
    const isConnected = await verifyServerConnection();
    if (!isConnected) {
        document.getElementById('loading-indicator').innerHTML = 
            'Error: Could not connect to server. Please check if server is running on port 5501';
        return;
    }

    // Continue with dashboard initialization
    await initializeDashboard();
    setupFormListeners();
    await loadDetailedFarmData();
});

async function initializeDashboard() {
    try {
        // Show loading state
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) loadingIndicator.classList.remove('hidden');

        // Get static demo data
        const allData = await fetchAllDatasets();

        // Create necessary chart containers if they don't exist
        createChartContainers();

        // Update dashboard components
        await Promise.all([
            updateDashboardCards(allData.farmData),
            createComprehensiveCharts(allData),
            updateDataTables(allData)
        ]);

        // Hide loading state
        if (loadingIndicator) loadingIndicator.classList.add('hidden');

    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Failed to load dashboard data: ' + error.message);
    }
}

// Add this function to create chart containers dynamically
function createChartContainers() {
    const chartContainers = [
        { id: 'soil-analysis-chart', title: 'Soil Analysis' },
        { id: 'crop-yields-chart', title: 'Crop Yields' },
        { id: 'weather-impact-chart', title: 'Weather Impact' },
        { id: 'market-analysis-chart', title: 'Market Analysis' }
    ];

    const dashboardContainer = document.getElementById('dashboard-charts') || 
                             document.createElement('div');
    dashboardContainer.id = 'dashboard-charts';
    dashboardContainer.className = 'dashboard-charts-container';

    chartContainers.forEach(({ id, title }) => {
        if (!document.getElementById(id)) {
            const chartSection = document.createElement('div');
            chartSection.className = 'chart-section';
            chartSection.innerHTML = `
                <h3>${title}</h3>
                <div class="chart-container">
                    <canvas id="${id}"></canvas>
                </div>
            `;
            dashboardContainer.appendChild(chartSection);
        }
    });

    // Add to document if not already present
    if (!document.getElementById('dashboard-charts')) {
        document.body.appendChild(dashboardContainer);
    }
}

// Add this CSS to your stylesheet
const style = document.createElement('style');
style.textContent = `
    .dashboard-charts-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        padding: 20px;
    }

    .chart-section {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        padding: 15px;
    }

    .chart-container {
        position: relative;
        height: 300px;
    }

    .chart-container canvas {
        width: 100% !important;
        height: 100% !important;
    }
`;
document.head.appendChild(style);

// Update the fetchAllDatasets function to include error handling and default values
async function fetchAllDatasets() {
    try {
        // For demonstration, return static data instead of fetching
        return getStaticDemoData();
    } catch (error) {
        console.error('Error loading datasets:', error);
        throw new Error('Failed to load demonstration data');
    }
}

// Add default data function
function getDefaultData(type) {
    const defaults = {
        farm: {
            averageYield: 0,
            averagePH: 0,
            totalRecords: 0
        },
        soil: {
            composition: {
                clay: 0,
                silt: 0,
                sand: 0,
                organic: 0
            }
        },
        crop: {
            timeline: [],
            crops: []
        },
        weather: {
            parameters: [],
            impact_scores: []
        },
        market: {
            timeline: [],
            demand_trend: [],
            supply_trend: [],
            price_index: []
        },
        all: {
            farmData: { /* Default farm data */ },
            soilData: { /* Default soil data */ },
            cropData: { /* Default crop data */ },
            weatherData: { /* Default weather data */ },
            marketData: { /* Default market data */ }
        }
    };

    return defaults[type] || defaults.all;
}

async function fetchFarmData() {
    const response = await fetch(`${API_BASE_URL}/farm-data`);
    if (!response.ok) throw new Error('Failed to fetch farm data');
    return await response.json();
}

function updateDashboardCards(data) {
    document.getElementById('avg-yield').textContent = 
        data.averageYield.toFixed(1);
    document.getElementById('avg-ph').textContent = 
        data.averagePH.toFixed(1);
    document.getElementById('total-records').textContent = 
        data.totalRecords;
}

function createSoilDistributionChart(data) {
    const ctx = document.createElement('canvas');
    document.getElementById('soil-distribution').appendChild(ctx);
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(data.statistics.soil_distribution),
            datasets: [{
                data: Object.values(data.statistics.soil_distribution),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Soil Type Distribution'
                }
            }
        }
    });
}

function createCropDistributionChart(data) {
    const ctx = document.createElement('canvas');
    document.getElementById('crop-distribution').appendChild(ctx);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data.statistics.crop_distribution),
            datasets: [{
                label: 'Crop Distribution',
                data: Object.values(data.statistics.crop_distribution),
                backgroundColor: '#36A2EB'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function populateSoilTypeOptions(soilTypes) {
    const select = document.getElementById('soil-type');
    select.innerHTML = soilTypes
        .map(type => `<option value="${type}">${type}</option>`)
        .join('');
}

function setupFormListeners() {
    const form = document.getElementById('recommendation-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch(`${API_BASE_URL}/recommendations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error('Failed to get recommendations');
            
            const result = await response.json();
            displayRecommendations(result);
            document.getElementById('recommendations').classList.remove('hidden');
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to get recommendations');
        }
    });
}

function displayRecommendations(data) {
    // Display primary crop
    document.getElementById('primary-crop').innerHTML = `
        <h3>Recommended Crop</h3>
        <div class="primary-crop-card">
            <p class="crop-name">${data.primary_crop}</p>
            <p class="confidence">Confidence: ${(data.confidence * 100).toFixed(1)}%</p>
        </div>
    `;

    // Display alternative crops
    document.getElementById('alternative-crops').innerHTML = `
        <h3>Alternative Crops</h3>
        <div class="alternative-crops-list">
            ${data.alternative_crops.map(crop => `
                <div class="crop-item">${crop}</div>
            `).join('')}
        </div>
    `;

    // Display sustainability metrics
    const metrics = data.sustainability_metrics;
    document.getElementById('sustainability-metrics').innerHTML = `
        <h3>Sustainability Metrics</h3>
        <div class="metrics-grid">
            <div class="metric-item">
                <label>Water Usage</label>
                <div class="metric-bar" style="width: ${metrics.water * 10}%">${metrics.water}/10</div>
            </div>
            <div class="metric-item">
                <label>Carbon Footprint</label>
                <div class="metric-bar" style="width: ${metrics.carbon * 10}%">${metrics.carbon}/10</div>
            </div>
            <div class="metric-item">
                <label>Soil Impact</label>
                <div class="metric-bar" style="width: ${metrics.soil * 10}%">${metrics.soil}/10</div>
            </div>
        </div>
    `;

    // Display weather impact
    document.getElementById('weather-impact').innerHTML = `
        <h3>Weather Impact</h3>
        <div class="weather-impact-card ${data.weather_impact.risk_level}">
            <p>Risk Level: ${data.weather_impact.risk_level.toUpperCase()}</p>
            <ul>
                ${data.weather_impact.recommendations.map(rec => `
                    <li>${rec}</li>
                `).join('')}
            </ul>
        </div>
    `;
}

async function loadHistoricalData() {
    try {
        const response = await fetch(`${API_BASE_URL}/historical`);
        if (!response.ok) throw new Error('Failed to fetch historical data');
        
        const data = await response.json();
        updateHistoricalTable(data.predictions);
        createPerformanceChart(data.predictions);
    } catch (error) {
        console.error('Error loading historical data:', error);
    }
}

function showError(message) {
    // Implement error notification system here
    alert(message);
}

// API Service Class
class FarmingAPI {
    static async getWeather(lat, lon) {
        const response = await fetch(`${API_BASE_URL}/api/weather?lat=${lat}&lon=${lon}`);
        return await response.json();
    }

    static async getRecommendations(data) {
        const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        body: JSON.stringify(data)
        });
        return await response.json();
    }

    static async getAgentRecommendations(data) {
        const response = await fetch(`${API_BASE_URL}/api/agent-recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    }

    static async submitFeedback(data) {
        const response = await fetch(`${API_BASE_URL}/api/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    }
}

// UI Component Class
class FarmingUI {
    constructor() {
        this.farmDataForm = document.getElementById('farmDataForm');
        this.resultsSection = document.getElementById('results');
        this.loadingSpinner = document.getElementById('loading');
        this.weatherInfo = document.getElementById('weatherInfo');
        this.marketAnalysis = document.getElementById('marketAnalysis');
        this.historyTableBody = document.getElementById('historyTableBody');
        
        this.initializeEventListeners();
        this.initializeWeather();
    }

    initializeEventListeners() {
        this.farmDataForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmission(e);
        });
    }

    async initializeWeather() {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const weather = await FarmingAPI.getWeather(
                    position.coords.latitude,
                    position.coords.longitude
                );
                this.updateWeatherDisplay(weather);
            } catch (error) {
                console.error('Error fetching weather:', error);
            }
        });
    }

    async handleFormSubmission(e) {
        this.loadingSpinner.style.display = 'block';
        
        try {
            const formData = new FormData(this.farmDataForm);
            const data = Object.fromEntries(formData.entries());
            
            // Get both AI and agent recommendations
            const [aiRecommendations, agentRecommendations] = await Promise.all([
                FarmingAPI.getRecommendations(data),
                FarmingAPI.getAgentRecommendations(data)
            ]);
            
            this.displayResults(aiRecommendations, agentRecommendations);
        } catch (error) {
            console.error('Error:', error);
            alert('Error getting recommendations. Please try again.');
        } finally {
            this.loadingSpinner.style.display = 'none';
        }
    }

    updateWeatherDisplay(weather) {
        this.weatherInfo.innerHTML = `
            <h3>Current Weather</h3>
            <p>Temperature: ${weather.temperature}°C</p>
            <p>Humidity: ${weather.humidity}%</p>
            <p>Conditions: ${weather.weather}</p>
        `;
    }

    displayResults(aiData, agentData) {
        this.resultsSection.innerHTML = `
            <div class="results-container">
                <div class="ai-recommendations">
                    <h2>AI Recommendations</h2>
                    <div class="recommendation-card">
                        <h3>Recommended Crop</h3>
                        <p>${aiData.recommended_crop}</p>
                        <p>Confidence: ${(aiData.confidence * 100).toFixed(1)}%</p>
                    </div>
                </div>
                
                <div class="expert-recommendations">
                    <h2>Expert Recommendations</h2>
                    <div class="practices-card">
                        <h3>Sustainable Practices</h3>
                        <ul>
                            ${agentData.expert_recommendations.sustainable_practices.map(practice => `
                                <li>${practice}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="market-insights">
                    <h2>Market Insights</h2>
                    <div class="market-card">
                        <h3>Market Trends</h3>
                        <p>Demand Level: ${agentData.market_insights.demand_level}</p>
                        <p>Price Trend: ${agentData.market_insights.price_trend}</p>
                    </div>
                </div>
            </div>
        `;
    }

    displayMarketAnalysis(marketData) {
        if (!marketData) {
            this.marketAnalysis.innerHTML = '<p>Market analysis data not available.</p>';
            return;
        }
        
        this.marketAnalysis.innerHTML = `
            <div class="market-overview">
                <h3>Market Overview</h3>
                <div class="market-stats">
                    <div class="stat">
                        <span class="stat-label">Market Demand</span>
                        <span class="stat-value">${marketData.demand_level}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Price Trend</span>
                        <span class="stat-value">${marketData.price_trend}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Profitability Index</span>
                        <span class="stat-value">${marketData.profitability_index}/10</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// Handle form submission
document.getElementById('farm-data-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    try {
        // Show loading state
        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        // Get form data
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        // Submit data to backend
        const response = await apiService.submitFarmData(data);

        // Handle successful response
        if (response.status === 'success') {
            displayRecommendations(response);
            document.getElementById('recommendations').classList.remove('hidden');
        } else {
            throw new Error(response.message || 'Failed to get recommendations');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your request. Please try again.');
    } finally {
        // Reset button state
        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Get Recommendations';
    }
});

// Display recommendations
function displayRecommendations(data) {
    // Update crop recommendations
    const cropRecsContainer = document.getElementById('crop-recommendations');
    cropRecsContainer.innerHTML = `
        <div class="recommendation-card">
            <h4>Recommended Crop: ${data.crop_recommendation.crop}</h4>
            <p>Expected Yield: ${data.crop_recommendation.expected_yield}</p>
        </div>
    `;

    // Update farming practices
    const practicesContainer = document.getElementById('practice-recommendations');
    practicesContainer.innerHTML = `
        <ul>
            ${data.farming_practices.sustainable_practices.map(practice => `
                <li>${practice}</li>
            `).join('')}
        </ul>
    `;

    // Update market analysis
    const marketContainer = document.getElementById('market-analysis');
    marketContainer.innerHTML = `
        <div class="market-info">
            <h4>Market Insights</h4>
            <p>Demand: ${data.market_insights.demand_level}</p>
            <p>Price Trend: ${data.market_insights.price_trend}</p>
        </div>
    `;
}

// Load initial weather data
document.addEventListener('DOMContentLoaded', async () => {
    const locationInput = document.getElementById('location');
    if (locationInput && locationInput.value) {
        try {
            const weatherData = await apiService.getWeatherData(locationInput.value);
            updateWeatherWidget(weatherData);
        } catch (error) {
            console.error('Failed to load weather data:', error);
        }
    }
});

// Update weather widget
function updateWeatherWidget(data) {
    document.getElementById('weather-temp').textContent = `${data.temperature}°C`;
    document.getElementById('weather-desc').textContent = data.description;
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new FarmingUI();
    new FarmDataVisualizer();
});

class FarmDataUI {
    constructor() {
        this.table = document.getElementById('farm-data-table');
        this.filterSelect = document.getElementById('data-filter');
        this.refreshButton = document.getElementById('refresh-data');
        this.loadingIndicator = document.getElementById('loading-indicator');
        
        this.columnDefinitions = {
            'soil_ph': { label: 'Soil pH', format: 'number' },
            'soil_mixture': { label: 'Soil Mixture', format: 'text' },
            'temperature': { label: 'Temperature (°C)', format: 'number' },
            'rainfall': { label: 'Rainfall (mm)', format: 'number' },
            'crop_type': { label: 'Crop Type', format: 'text' },
            'fertilizer': { label: 'Fertilizer', format: 'text' },
            'pesticide': { label: 'Pesticide', format: 'text' },
            'usage': { label: 'Usage', format: 'number' },
            'crop_yield': { label: 'Crop Yield', format: 'number' },
            'sustainability': { label: 'Sustainability', format: 'text' }
        };
        
        this.initializeTable();
        this.loadData();
    }

    initializeEventListeners() {
        this.refreshButton.addEventListener('click', () => this.loadData());
        this.filterSelect.addEventListener('change', () => this.applyFilter());
    }

    async loadData() {
        try {
            this.showLoading(true);
            const data = await farmDataService.getFarmData();
            this.renderTable(data);
            this.applyFilter();
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load farm data. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    renderTable(data) {
        const headers = Object.entries(this.columnDefinitions)
            .map(([key, def]) => `<th title="${def.label}">${def.label}</th>`)
            .join('');
            
        const rows = data.map(row => `
            <tr>
                ${Object.entries(this.columnDefinitions)
                    .map(([key, def]) => `
                        <td>${this.formatCell(row[key], def.format)}</td>
                    `)
                    .join('')}
            </tr>
        `).join('');

        this.table.innerHTML = `
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
        `;
    }

    formatHeader(header) {
        return header
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    formatCell(value, format) {
        if (value === null || value === undefined) return '-';
        
        switch (format) {
            case 'number':
                return typeof value === 'number' ? 
                    value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }) : value;
            case 'text':
                return value.toString();
            default:
                return value;
        }
    }

    applyFilter() {
        const rows = this.table.querySelectorAll('tbody tr');
        const filter = this.filterSelect.value;
        
        if (filter === 'recent') {
            rows.forEach((row, index) => {
                row.classList.toggle('hidden', index >= 10);
            });
        } else {
            rows.forEach(row => row.classList.remove('hidden'));
        }
    }

    showLoading(show) {
        this.loadingIndicator.classList.toggle('hidden', !show);
        this.table.classList.toggle('hidden', show);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FarmDataUI();
});

class FarmDataManager {
    constructor() {
        this.apiBaseUrl = window.API_BASE_URL;
        this.farmData = null;
        this.charts = {};
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.initializeApp();
    }

    async initializeApp() {
        try {
            await this.fetchFarmData();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load farm data');
        }
    }

    async fetchFarmData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/farm-data`);
            if (!response.ok) throw new Error('Failed to fetch data');
            
            this.farmData = await response.json();
            if (this.farmData.status === 'success') {
                this.updateDashboard();
            } else {
                throw new Error('Invalid data received');
            }
        } catch (error) {
            throw new Error(`Data fetch failed: ${error.message}`);
        }
    }

    updateDashboard() {
        this.updateSummaryCards();
        this.createCharts();
        this.populateTable();
        this.populateFilters();
    }

    updateSummaryCards() {
        const { summary } = this.farmData;
        document.getElementById('avg-yield').textContent = summary.avg_yield.toFixed(2);
        document.getElementById('avg-ph').textContent = summary.avg_ph.toFixed(2);
        document.getElementById('total-records').textContent = summary.total_records;
    }

    createCharts() {
        // Create Crop Distribution Chart
        const cropCtx = document.getElementById('crop-distribution-chart').getContext('2d');
        this.charts.cropDistribution = new Chart(cropCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(this.farmData.summary.crop_distribution),
                datasets: [{
                    data: Object.values(this.farmData.summary.crop_distribution),
                    backgroundColor: [
                        '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B',
                        '#FFC107', '#FF9800', '#FF5722'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });

        // Create Yield Trends Chart
        const yieldCtx = document.getElementById('yield-trend-chart').getContext('2d');
        const yieldData = this.farmData.data.map(item => ({
            value: item.crop_yield,
            date: new Date(item.date).toLocaleDateString()
        }));
        this.charts.yieldTrends = new Chart(yieldCtx, {
            type: 'line',
            data: {
                labels: yieldData.map(d => d.date),
                datasets: [{
                    label: 'Crop Yield',
                    data: yieldData.map(d => d.value),
                    borderColor: '#4CAF50',
                    tension: 0.1
                }]
            }
        });
    }

    populateTable() {
        const tbody = document.querySelector('#farm-data-table tbody');
        tbody.innerHTML = '';

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const paginatedData = this.farmData.data.slice(start, end);

        paginatedData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.soil_type}</td>
                <td>${row.crop_type}</td>
                <td>${row.water_availability}</td>
                <td>${row.soil_ph}</td>
                <td>${row.crop_yield}</td>
                <td>${row.season || 'N/A'}</td>
                <td>
                    <button class="btn-view" data-id="${row.id || ''}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        this.updatePagination();
    }

    updatePagination() {
        const totalPages = Math.ceil(this.farmData.data.length / this.itemsPerPage);
        document.getElementById('page-info').textContent = `Page ${this.currentPage} of ${totalPages}`;
        document.getElementById('prev-page').disabled = this.currentPage === 1;
        document.getElementById('next-page').disabled = this.currentPage === totalPages;
    }

    populateFilters() {
        const data = this.farmData.data;
        const soilTypes = [...new Set(data.map(item => item.soil_type))];
        const cropTypes = [...new Set(data.map(item => item.crop_type))];

        this.populateFilter('soil-filter', soilTypes);
        this.populateFilter('crop-filter', cropTypes);
    }

    populateFilter(filterId, options) {
        const select = document.getElementById(filterId);
        select.innerHTML = '<option value="all">All</option>';
        options.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option;
            optElement.textContent = option;
            select.appendChild(optElement);
        });
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('farm-data-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(e);
        });

        // Filters
        document.getElementById('soil-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('crop-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('yield-filter').addEventListener('change', () => this.applyFilters());

        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => this.changePage(-1));
        document.getElementById('next-page').addEventListener('click', () => this.changePage(1));

        // Export
        document.getElementById('export-data').addEventListener('click', () => this.exportData());
    }

    applyFilters() {
        const soilType = document.getElementById('soil-filter').value;
        const cropType = document.getElementById('crop-filter').value;
        const yieldRange = document.getElementById('yield-filter').value;

        let filteredData = this.farmData.data;

        if (soilType !== 'all') {
            filteredData = filteredData.filter(item => item.soil_type === soilType);
        }
        if (cropType !== 'all') {
            filteredData = filteredData.filter(item => item.crop_type === cropType);
        }
        if (yieldRange !== 'all') {
            // Add yield range filtering logic here
        }

        this.currentPage = 1;
        this.populateTable(filteredData);
    }

    changePage(delta) {
        this.currentPage += delta;
        this.populateTable();
    }

    exportData() {
        const csvContent = this.convertToCSV(this.farmData.data);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'farm_data.csv';
        link.click();
    }

    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(header => row[header]));
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FarmDataManager();
});
// Add this to your existing JavaScript code

import * as XLSX from 'xlsx';

class ExcelDataImporter {
    constructor() {
        this.fileInput = null;
        this.uploadForm = null;
        this.progressBar = null;
        this.initialize();
    }

    initialize() {
        this.createUploadInterface();
        this.setupEventListeners();
    }

    createUploadInterface() {
        // Create the file upload interface if it doesn't exist
        if (!document.getElementById('excel-import-section')) {
            const importSection = document.createElement('div');
            importSection.id = 'excel-import-section';
            importSection.className = 'card mb-4';
            importSection.innerHTML = `
                <div class="card-header">
                    <h3>Import Farm Data from Excel</h3>
                </div>
                <div class="card-body">
                    <form id="excel-upload-form">
                        <div class="mb-3">
                            <label for="excel-file" class="form-label">Select Excel File (.xlsx)</label>
                            <input type="file" class="form-control" id="excel-file" accept=".xlsx" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Sheet Selection</label>
                            <select id="sheet-selector" class="form-select" disabled>
                                <option value="">First select an Excel file...</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <div id="mapping-container" class="d-none">
                                <h5>Map Excel Columns to Farm Data Fields</h5>
                                <div id="column-mapping" class="row g-3"></div>
                            </div>
                        </div>
                        <div class="mb-3 d-none" id="progress-container">
                            <label class="form-label">Import Progress</label>
                            <div class="progress">
                                <div id="import-progress" class="progress-bar" role="progressbar" style="width: 0%"></div>
                            </div>
                        </div>
                        <button type="button" id="preview-data-btn" class="btn btn-secondary me-2" disabled>Preview Data</button>
                        <button type="submit" id="import-data-btn" class="btn btn-primary" disabled>Import Data</button>
                    </form>
                </div>
                <div id="preview-section" class="card-footer d-none">
                    <h4>Data Preview</h4>
                    <div class="table-responsive">
                        <table id="preview-table" class="table table-striped table-bordered">
                            <thead><tr><th>Loading preview...</th></tr></thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            `;

            // Insert the import section before the farm data form or at the beginning of the content area
            const targetElement = document.getElementById('farmDataForm') || document.querySelector('.content');
            if (targetElement) {
                targetElement.parentNode.insertBefore(importSection, targetElement);
            } else {
                document.body.insertBefore(importSection, document.body.firstChild);
            }
        }

        this.fileInput = document.getElementById('excel-file');
        this.sheetSelector = document.getElementById('sheet-selector');
        this.uploadForm = document.getElementById('excel-upload-form');
        this.previewButton = document.getElementById('preview-data-btn');
        this.importButton = document.getElementById('import-data-btn');
        this.progressBar = document.getElementById('import-progress');
        this.progressContainer = document.getElementById('progress-container');
        this.previewSection = document.getElementById('preview-section');
        this.previewTable = document.getElementById('preview-table');
        this.mappingContainer = document.getElementById('mapping-container');
        this.columnMapping = document.getElementById('column-mapping');
    }

    setupEventListeners() {
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.sheetSelector.addEventListener('change', () => this.handleSheetSelect());
        this.previewButton.addEventListener('click', () => this.previewData());
        this.uploadForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const data = await this.readExcelFile(file);
            const sheetNames = data.SheetNames;
            
            // Populate sheet selector
            this.sheetSelector.innerHTML = '';
            sheetNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                this.sheetSelector.appendChild(option);
            });
            
            this.sheetSelector.disabled = false;
            this.excelData = data;
            
            // If there's only one sheet, automatically select it
            if (sheetNames.length === 1) {
                this.handleSheetSelect();
            }
        } catch (error) {
            console.error('Error reading Excel file:', error);
            alert('Failed to read Excel file. Please check the file format.');
        }
    }

    handleSheetSelect() {
        const selectedSheet = this.sheetSelector.value;
        if (!selectedSheet) return;

        const worksheet = this.excelData.Sheets[selectedSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
            alert('The selected sheet does not contain enough data. Please select another sheet.');
            return;
        }

        // Extract headers (first row)
        const headers = jsonData[0];
        this.createColumnMapping(headers);
        
        this.previewButton.disabled = false;
        this.importButton.disabled = false;
    }

    createColumnMapping(excelHeaders) {
        // Define expected farm data fields
        const farmDataFields = [
            { id: 'soil_ph', label: 'Soil pH' },
            { id: 'soil_mixture', label: 'Soil Mixture' },
            { id: 'temperature', label: 'Temperature (°C)' },
            { id: 'rainfall', label: 'Rainfall (mm)' },
            { id: 'crop_type', label: 'Crop Type' },
            { id: 'fertilizer', label: 'Fertilizer' },
            { id: 'pesticide', label: 'Pesticide' },
            { id: 'usage', label: 'Usage' },
            { id: 'crop_yield', label: 'Crop Yield' },
            { id: 'sustainability', label: 'Sustainability' }
        ];

        // Clear previous mappings
        this.columnMapping.innerHTML = '';
        
        // Create mapping UI
        farmDataFields.forEach(field => {
            const colDiv = document.createElement('div');
            colDiv.className = 'col-md-6 col-lg-4';
            
            const select = document.createElement('select');
            select.className = 'form-select mapping-select';
            select.dataset.fieldId = field.id;
            
            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '-- Not Mapped --';
            select.appendChild(emptyOption);
            
            // Add Excel header options
            excelHeaders.forEach((header, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = header;
                // Auto-select if the header name closely matches the field name
                if (this.isHeaderMatch(header, field.id, field.label)) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
            
            colDiv.innerHTML = `
                <div class="form-group">
                    <label class="form-label">${field.label}</label>
                    ${select.outerHTML}
                </div>
            `;
            
            this.columnMapping.appendChild(colDiv);
        });
        
        this.mappingContainer.classList.remove('d-none');
    }

    isHeaderMatch(header, fieldId, fieldLabel) {
        if (!header) return false;
        
        header = header.toString().toLowerCase();
        fieldId = fieldId.toLowerCase();
        fieldLabel = fieldLabel.toLowerCase();
        
        // Check for exact matches or common variations
        if (header === fieldId || header === fieldLabel) return true;
        if (header === fieldId.replace('_', ' ') || header === fieldId.replace('_', '')) return true;
        
        // Check for partial matches
        const cleanHeader = header.replace(/[^a-z0-9]/g, '');
        const cleanFieldId = fieldId.replace(/[^a-z0-9]/g, '');
        const cleanFieldLabel = fieldLabel.replace(/[^a-z0-9]/g, '');
        
        return cleanHeader.includes(cleanFieldId) || 
               cleanFieldId.includes(cleanHeader) ||
               cleanHeader.includes(cleanFieldLabel) ||
               cleanFieldLabel.includes(cleanHeader);
    }

    previewData() {
        const selectedSheet = this.sheetSelector.value;
        if (!selectedSheet) return;

        const worksheet = this.excelData.Sheets[selectedSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Get current mappings
        const mappings = this.getColumnMappings();
        
        // Create preview table
        const headers = Object.values(mappings).map(mapping => mapping.fieldLabel);
        const previewRows = jsonData.slice(1, 6); // Take first 5 rows for preview
        
        let tableHTML = '<thead><tr>';
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';
        
        previewRows.forEach(row => {
            tableHTML += '<tr>';
            Object.values(mappings).forEach(mapping => {
                const colIndex = mapping.excelColIndex;
                const cellValue = colIndex !== null && colIndex < row.length ? row[colIndex] : '-';
                tableHTML += `<td>${cellValue}</td>`;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody>';
        
        this.previewTable.innerHTML = tableHTML;
        this.previewSection.classList.remove('d-none');
    }

    getColumnMappings() {
        const mappings = {};
        const mappingSelects = this.columnMapping.querySelectorAll('.mapping-select');
        
        mappingSelects.forEach(select => {
            const fieldId = select.dataset.fieldId;
            const excelColIndex = select.value !== '' ? parseInt(select.value) : null;
            const fieldLabel = select.parentElement.querySelector('label').textContent;
            
            mappings[fieldId] = {
                fieldId,
                fieldLabel,
                excelColIndex
            };
        });
        
        return mappings;
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        const selectedSheet = this.sheetSelector.value;
        if (!selectedSheet) {
            alert('Please select a sheet from the Excel file.');
            return;
        }
        
        // Show progress container
        this.progressContainer.classList.remove('d-none');
        this.progressBar.style.width = '0%';
        this.progressBar.textContent = '0%';
        
        try {
            const worksheet = this.excelData.Sheets[selectedSheet];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const dataRows = jsonData.slice(1); // Skip header row
            const mappings = this.getColumnMappings();
            
            // Process data in chunks to avoid UI freezing
            const chunkSize = 100;
            const totalChunks = Math.ceil(dataRows.length / chunkSize);
            
            const processedData = [];
            
            for (let i = 0; i < totalChunks; i++) {
                const chunk = dataRows.slice(i * chunkSize, (i + 1) * chunkSize);
                const processedChunk = this.processDataChunk(chunk, mappings);
                processedData.push(...processedChunk);
                
                // Update progress
                const progress = Math.round(((i + 1) / totalChunks) * 100);
                this.updateProgress(progress);
                
                // Let UI update
                await new Promise(resolve => setTimeout(resolve, 0));
            }
            
            // Save the processed data
            await this.saveProcessedData(processedData);
            
            alert(`Successfully imported ${processedData.length} records from Excel.`);
            
            // Refresh the page to show the imported data
            if (confirm('Would you like to refresh the page to see the imported data?')) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error importing data:', error);
            alert('Failed to import data: ' + error.message);
        } finally {
            this.progressContainer.classList.add('d-none');
        }
    }

    processDataChunk(rows, mappings) {
        return rows.map(row => {
            const dataObject = {};
            
            Object.entries(mappings).forEach(([fieldId, mapping]) => {
                const { excelColIndex } = mapping;
                if (excelColIndex !== null && excelColIndex < row.length) {
                    dataObject[fieldId] = row[excelColIndex];
                } else {
                    dataObject[fieldId] = null;
                }
            });
            
            return dataObject;
        });
    }

    updateProgress(percentage) {
        this.progressBar.style.width = `${percentage}%`;
        this.progressBar.textContent = `${percentage}%`;
    }

    async saveProcessedData(data) {
        try {
            // Call API to save the data
            const response = await fetch(`${API_BASE_URL}/api/import-farm-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to save data');
            }
            
            return result;
        } catch (error) {
            console.error('Error saving data:', error);
            throw new Error('Failed to save imported data to the server');
        }
    }

    async readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    resolve(workbook);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = function(error) {
                reject(error);
            };
            
            reader.readAsArrayBuffer(file);
        });
    }
}

// Add this to the API Service class
apiService.importFarmData = async function(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/import-farm-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error importing farm data:', error);
        throw new Error('Failed to import farm data');
    }
};

// Initialize the Excel importer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load the XLSX library if not already loaded
    if (typeof XLSX === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = () => {
            new ExcelDataImporter();
        };
        document.head.appendChild(script);
    } else {
        new ExcelDataImporter();
    }
});

import { APIService } from './api-service.js';

const api = new APIService();

// Initialize charts and data
async function initializeApp() {
    try {
        // Load initial farm data
        const farmData = await api.getFarmData();
        updateDashboard(farmData);
        
        // Set up form submission
        const form = document.getElementById('farm-data-form');
        form.addEventListener('submit', handleFormSubmit);
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to load initial data');
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    try {
        const recommendations = await api.getRecommendations(data);
        displayRecommendations(recommendations);
    } catch (error) {
        showError('Failed to get recommendations');
    }
}

function updateDashboard(data) {
    // Update summary cards
    document.getElementById('avg-yield').textContent = data.averageYield || '-';
    document.getElementById('avg-ph').textContent = data.averagePH || '-';
    document.getElementById('total-records').textContent = data.totalRecords || '-';
    
    // Update charts
    updateCharts(data);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initializeApp);

async function loadDetailedFarmData() {
    try {
        const response = await fetch(`${API_BASE_URL}/detailed-farm-data`);
        if (!response.ok) throw new Error('Failed to fetch detailed farm data');
        
        const data = await response.json();
        
        // Update soil analysis section
        updateSoilAnalysis(data.soilAnalysis);
        
        // Update crop yields section
        updateCropYields(data.cropYields);
        
        // Update weather patterns
        updateWeatherPatterns(data.weatherPatterns);
        
    } catch (error) {
        console.error('Error loading detailed farm data:', error);
        showError('Failed to load farm data');
    }
}

function updateSoilAnalysis(data) {
    const soilDistribution = document.getElementById('soil-distribution');
    const avgPh = document.getElementById('avg-ph');
    
    // Update soil distribution chart
    new Chart(soilDistribution.getContext('2d'), {
        type: 'pie',
        data: {
            labels: Object.keys(data.types),
            datasets: [{
                data: Object.values(data.types),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Soil Type Distribution'
                }
            }
        }
    });
    
    // Update average pH
    avgPh.textContent = data.avgPH.toFixed(2);
}

function updateCropYields(data) {
    const cropYieldsChart = document.createElement('canvas');
    document.getElementById('market-trends').appendChild(cropYieldsChart);
    
    new Chart(cropYieldsChart.getContext('2d'), {
        type: 'bar',
        data: {
            labels: Object.keys(data.byCrop),
            datasets: [{
                label: 'Average Yield by Crop',
                data: Object.values(data.byCrop),
                backgroundColor: '#36A2EB'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Yield (tons/hectare)'
                    }
                }
            }
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadDetailedFarmData();
    setupFormListeners();
});

class FarmDataVisualizer {
    constructor() {
        this.charts = {};
    }

    async initialize() {
        try {
            const [farmData, marketData] = await Promise.all([
                this.fetchFarmData(),
                this.fetchMarketData()
            ]);

            this.updateSoilAndCropMetrics(farmData);
            this.updateMarketMetrics(marketData);
            this.createCharts(farmData, marketData);
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to load data');
        }
    }

    async fetchFarmData() {
        const response = await fetch(`${API_BASE_URL}/farm-data`);
        if (!response.ok) throw new Error('Failed to fetch farm data');
        return await response.json();
    }

    async fetchMarketData() {
        const response = await fetch(`${API_BASE_URL}/market-data`);
        if (!response.ok) throw new Error('Failed to fetch market data');
        return await response.json();
    }

    updateSoilAndCropMetrics(data) {
        document.getElementById('avg-ph').textContent = data.avgSoilPH.toFixed(2);
        document.getElementById('avg-yield').textContent = `${data.avgCropYield.toFixed(2)} t/ha`;
        
        this.createSustainabilityGauge(data.sustainabilityScore);
        this.createResourceUsageCharts(data);
    }

    updateMarketMetrics(data) {
        document.getElementById('demand-index').textContent = data.demandIndex.toFixed(1);
        document.getElementById('supply-index').textContent = data.supplyIndex.toFixed(1);
        
        this.createMarketTrendCharts(data);
        this.createSeasonalAnalysis(data);
    }

    createCharts(farmData, marketData) {
        // Supply-Demand Chart
        this.charts.supplyDemand = new Chart(
            document.getElementById('supply-demand-chart').getContext('2d'),
            {
                type: 'line',
                data: {
                    labels: marketData.timeline,
                    datasets: [
                        {
                            label: 'Supply',
                            data: marketData.supplyTrend,
                            borderColor: '#36A2EB'
                        },
                        {
                            label: 'Demand',
                            data: marketData.demandTrend,
                            borderColor: '#FF6384'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );

        // Create other charts...
    }

    createSeasonalAnalysis(data) {
        const ctx = document.getElementById('seasonal-chart').getContext('2d');
        this.charts.seasonal = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Spring', 'Summer', 'Autumn', 'Winter'],
                datasets: [{
                    label: 'Seasonal Performance',
                    data: data.seasonalIndices,
                    fill: true,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgb(54, 162, 235)',
                    pointBackgroundColor: 'rgb(54, 162, 235)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(54, 162, 235)'
                }]
            }
        });
    }

    showError(message) {
        // Implement error notification
        console.error(message);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new FarmDataVisualizer();
    visualizer.initialize();
});

class DashboardManager {
    constructor() {
        this.initializeDashboard();
    }

    async initializeDashboard() {
        try {
            const [farmData, marketData] = await Promise.all([
                fetchData('farm-data'),
                fetchData('market-data')
            ]);

            this.updateStatCards(farmData.averages);
            this.createDistributionCharts(farmData.distributions);
            this.createResourceUsageChart(farmData.resource_usage);
            this.createMarketTrendsChart(marketData.trends);
            this.populateDataTables(farmData.raw_data, marketData.raw_data);
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
        }
    }

    updateStatCards(averages) {
        document.getElementById('avg-soil-ph').textContent = averages.soilph.toFixed(2);
        document.getElementById('avg-crop-yield').textContent = `${averages.crop_yield.toFixed(2)} t/ha`;
        document.getElementById('avg-fertilizer').textContent = `${averages.fertilizer_usage.toFixed(1)} kg/ha`;
        document.getElementById('sustainability-score').textContent = averages.sustainability.toFixed(1);
    }

    // ... Add other required methods for charts and tables
}

document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
import { DataService } from './services/dataService.js';

class DashboardController {
    constructor() {
        this.charts = {};
        this.updateInterval = 30000; // Update every 30 seconds
        this.initialize();
    }

    async initialize() {
        try {
            await this.loadData();
            this.setupRealTimeUpdates();
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
        }
    }

    async loadData() {
        const [farmData, marketData] = await Promise.all([
            DataService.getFarmData(),
            DataService.getMarketData()
        ]);

        this.updateDashboardMetrics(farmData, marketData);
        this.createCharts(farmData, marketData);
    }

    updateDashboardMetrics(farmData, marketData) {
        // Update quick stats
        document.getElementById('avg-soil-ph').textContent = 
            farmData.averages.soilph.toFixed(2);
        document.getElementById('avg-crop-yield').textContent = 
            `${farmData.averages.crop_yield.toFixed(2)} t/ha`;
        document.getElementById('avg-fertilizer').textContent = 
            `${farmData.averages.fertilizer_usage.toFixed(1)} kg/ha`;
        document.getElementById('sustainability-score').textContent = 
            `${farmData.averages.sustainability.toFixed(1)}/10`;
    }

    createCharts(farmData, marketData) {
        // Soil Mixture Distribution Chart
        this.charts.soilMixture = new Chart(
            document.getElementById('soil-mixture-chart').getContext('2d'),
            {
                type: 'pie',
                data: {
                    labels: Object.keys(farmData.distributions.soil_mixture),
                    datasets: [{
                        data: Object.values(farmData.distributions.soil_mixture),
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        },
                        title: {
                            display: true,
                            text: 'Soil Type Distribution'
                        }
                    }
                }
            }
        );

        // Crop Distribution Chart
        this.charts.cropDistribution = new Chart(
            document.getElementById('crop-distribution-chart').getContext('2d'),
            {
                type: 'bar',
                data: {
                    labels: Object.keys(farmData.distributions.croptype),
                    datasets: [{
                        label: 'Crop Distribution',
                        data: Object.values(farmData.distributions.croptype),
                        backgroundColor: '#36A2EB'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );

        // Resource Usage Chart
        this.charts.resourceUsage = new Chart(
            document.getElementById('resource-usage-chart').getContext('2d'),
            {
                type: 'line',
                data: {
                    labels: farmData.resource_usage.fertilizer.labels,
                    datasets: [
                        {
                            label: 'Fertilizer Usage',
                            data: farmData.resource_usage.fertilizer.data,
                            borderColor: '#4BC0C0',
                            fill: false
                        },
                        {
                            label: 'Pesticide Usage',
                            data: farmData.resource_usage.pesticide.data,
                            borderColor: '#FF6384',
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );

        // Market Analysis Chart
        this.charts.marketAnalysis = new Chart(
            document.getElementById('market-analysis-chart').getContext('2d'),
            {
                type: 'line',
                data: {
                    labels: marketData.trends.demand.map((_, i) => `Day ${i + 1}`),
                    datasets: [
                        {
                            label: 'Demand',
                            data: marketData.trends.demand,
                            borderColor: '#36A2EB',
                            fill: false
                        },
                        {
                            label: 'Supply',
                            data: marketData.trends.supply,
                            borderColor: '#FF6384',
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );
    }

    setupRealTimeUpdates() {
        setInterval(async () => {
            try {
                await this.loadData();
            } catch (error) {
                console.error('Real-time update failed:', error);
            }
        }, this.updateInterval);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardController();
});

class FarmDataService {
    constructor() {
        this.baseUrl = '/backend/data/farmer_advisor_dataset.csv';
    }

    async fetchFarmData() {
        try {
            const response = await fetch(this.baseUrl);
            const csvText = await response.text();
            return this.parseCSV(csvText);
        } catch (error) {
            console.error('Error fetching farm data:', error);
            return [];
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        return lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
                obj[header.trim()] = values[index];
                return obj;
            }, {});
        });
    }

    formatValue(value, type) {
        if (type === 'number') {
            return parseFloat(value).toFixed(2);
        }
        return value;
    }

    async updateDashboard() {
        const data = await this.fetchFarmData();
        this.updateFarmTable(data);
        this.updateStatistics(data);
    }

    updateFarmTable(data) {
        const tbody = document.getElementById('farmDataBody');
        const cropFilter = document.getElementById('cropTypeFilter').value;

        const filteredData = cropFilter 
            ? data.filter(row => row.Crop_Type === cropFilter)
            : data;

        tbody.innerHTML = filteredData.map(row => `
            <tr>
                <td>${row.Farm_ID}</td>
                <td>${this.formatValue(row.Soil_pH, 'number')}</td>
                <td>${this.formatValue(row.Soil_Moisture, 'number')}</td>
                <td>${this.formatValue(row.Temperature_C, 'number')}</td>
                <td>${this.formatValue(row.Rainfall_mm, 'number')}</td>
                <td>${row.Crop_Type}</td>
                <td>${this.formatValue(row.Fertilizer_Usage_kg, 'number')}</td>
                <td>${this.formatValue(row.Pesticide_Usage_kg, 'number')}</td>
                <td>${this.formatValue(row.Crop_Yield_ton, 'number')}</td>
                <td>
                    <div class="sustainability-score" style="--score: ${row.Sustainability_Score}%">
                        ${this.formatValue(row.Sustainability_Score, 'number')}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateStatistics(data) {
        // Update dashboard statistics
        document.getElementById('avg-soil-ph').textContent = 
            this.formatValue(this.calculateAverage(data, 'Soil_pH'), 'number');
        
        document.getElementById('avg-crop-yield').textContent = 
            this.formatValue(this.calculateAverage(data, 'Crop_Yield_ton'), 'number');
        
        document.getElementById('sustainability-score').textContent = 
            this.formatValue(this.calculateAverage(data, 'Sustainability_Score'), 'number');
    }

    calculateAverage(data, field) {
        const sum = data.reduce((acc, row) => acc + parseFloat(row[field]), 0);
        return sum / data.length;
    }
}

// Initialize the service
document.addEventListener('DOMContentLoaded', () => {
    const farmDataService = new FarmDataService();
    
    // Initial load
    farmDataService.updateDashboard();

    // Setup event listeners
    document.getElementById('cropTypeFilter').addEventListener('change', () => {
        farmDataService.updateDashboard();
    });

    document.getElementById('refreshData').addEventListener('click', () => {
        farmDataService.updateDashboard();
    });
});

// Add these functions at an appropriate location in your file

async function fetchAllDatasets() {
    try {
        const responses = await Promise.all([
            fetch(`${API_BASE_URL}/farm-data`),
            fetch(`${API_BASE_URL}/soil-analysis`),
            fetch(`${API_BASE_URL}/crop-yields`),
            fetch(`${API_BASE_URL}/weather-patterns`),
            fetch(`${API_BASE_URL}/market-trends`)
        ]);

        const [farmData, soilData, cropData, weatherData, marketData] = 
            await Promise.all(responses.map(r => r.json()));

        return {
            farmData,
            soilData,
            cropData,
            weatherData,
            marketData
        };
    } catch (error) {
        console.error('Error fetching datasets:', error);
        throw new Error('Failed to fetch complete dataset');
    }
}

function createComprehensiveCharts(data) {
    // Soil Analysis Chart
    new Chart(document.getElementById('soil-analysis-chart').getContext('2d'), {
        type: 'radar',
        data: {
            labels: Object.keys(data.soilData.composition),
            datasets: [{
                label: 'Soil Composition',
                data: Object.values(data.soilData.composition),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: 'rgb(54, 162, 235)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // Crop Yield Trends
    new Chart(document.getElementById('crop-yields-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels: data.cropData.timeline,
            datasets: data.cropData.crops.map((crop, index) => ({
                label: crop.name,
                data: crop.yields,
                borderColor: getChartColor(index),
                fill: false
            }))
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Yield (tons/hectare)'
                    }
                }
            }
        }
    });

    // Weather Impact Chart
    new Chart(document.getElementById('weather-impact-chart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: data.weatherData.parameters,
            datasets: [{
                label: 'Weather Impact on Crops',
                data: data.weatherData.impact_scores,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });

    // Market Analysis Chart
    new Chart(document.getElementById('market-analysis-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels: data.marketData.timeline,
            datasets: [
                {
                    label: 'Demand',
                    data: data.marketData.demand_trend,
                    borderColor: 'rgb(75, 192, 192)',
                    fill: false
                },
                {
                    label: 'Supply',
                    data: data.marketData.supply_trend,
                    borderColor: 'rgb(255, 159, 64)',
                    fill: false
                },
                {
                    label: 'Price Index',
                    data: data.marketData.price_index,
                    borderColor: 'rgb(153, 102, 255)',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Utility function for chart colors
function getChartColor(index) {
    const colors = [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)'
    ];
    return colors[index % colors.length];
}

// Add real-time updates
function setupRealTimeUpdates() {
    setInterval(async () => {
        try {
            const allData = await fetchAllDatasets();
            updateDashboardCards(allData.farmData);
            createComprehensiveCharts(allData);
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }, 300000); // Update every 5 minutes
}

// Update data tables
function updateDataTables(data) {
    // Update soil analysis table
    const soilTable = document.getElementById('soil-analysis-table');
    if (soilTable) {
        soilTable.innerHTML = data.soilData.samples.map(sample => `
            <tr>
                <td>${sample.location}</td>
                <td>${sample.ph}</td>
                <td>${sample.nitrogen}%</td>
                <td>${sample.phosphorus}%</td>
                <td>${sample.potassium}%</td>
                <td>${sample.organic_matter}%</td>
            </tr>
        `).join('');
    }

    // Update crop yields table
    const cropTable = document.getElementById('crop-yields-table');
    if (cropTable) {
        cropTable.innerHTML = data.cropData.crops.map(crop => `
            <tr>
                <td>${crop.name}</td>
                <td>${crop.current_yield}</td>
                <td>${crop.predicted_yield}</td>
                <td>${crop.yield_change}%</td>
                <td>${crop.recommendation}</td>
            </tr>
        `).join('');
    }
}

// Add this function to create static demo data
function getStaticDemoData() {
    return {
        farmData: {
            averageYield: 75.3,
            averagePH: 6.8,
            totalRecords: 150,
            distributions: {
                soil_mixture: {
                    'Clay': 30,
                    'Loam': 40,
                    'Sandy': 20,
                    'Silt': 10
                },
                croptype: {
                    'Wheat': 45,
                    'Rice': 30,
                    'Corn': 25,
                    'Soybeans': 20,
                    'Cotton': 15
                }
            },
            resource_usage: {
                fertilizer: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    data: [65, 70, 80, 75, 85, 90]
                },
                pesticide: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    data: [20, 25, 30, 28, 32, 35]
                }
            }
        },
        soilData: {
            composition: {
                'Nitrogen': 65,
                'Phosphorus': 45,
                'Potassium': 55,
                'pH Level': 70,
                'Organic Matter': 40
            },
            samples: [
                { location: 'Field A', ph: 6.8, nitrogen: 65, phosphorus: 45, potassium: 55, organic_matter: 40 },
                { location: 'Field B', ph: 7.2, nitrogen: 70, phosphorus: 50, potassium: 60, organic_matter: 45 }
            ]
        },
        cropData: {
            timeline: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            crops: [
                { name: 'Wheat', yields: [4.2, 4.5, 4.8, 4.6, 4.9, 5.0] },
                { name: 'Rice', yields: [3.8, 4.0, 4.2, 4.1, 4.3, 4.5] },
                { name: 'Corn', yields: [5.5, 5.8, 6.0, 5.9, 6.2, 6.5] }
            ]
        },
        weatherData: {
            parameters: ['Rainfall', 'Temperature', 'Humidity', 'Wind', 'Sunlight'],
            impact_scores: [8.5, 7.2, 6.8, 4.5, 7.8]
        },
        marketData: {
            timeline: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            demand_trend: [80, 85, 90, 88, 92, 95],
            supply_trend: [75, 78, 82, 80, 85, 88],
            price_index: [100, 105, 108, 106, 110, 112]
        }
    };
}

// Add console log to verify script loading
console.log('Main.js is loading...');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing dashboard...');
    
    try {
        // Get all chart canvases
        const soilChart = document.getElementById('soil-mixture-chart');
        const cropChart = document.getElementById('crop-distribution-chart');
        const resourceChart = document.getElementById('resource-usage-chart');
        const marketChart = document.getElementById('market-analysis-chart');

        if (!soilChart || !cropChart || !resourceChart || !marketChart) {
            throw new Error('Chart containers not found');
        }

        // Get static demo data
        const data = getStaticDemoData();

        // Create charts with demo data
        new Chart(soilChart, {
            type: 'pie',
            data: {
                labels: ['Clay', 'Loam', 'Sandy', 'Silt'],
                datasets: [{
                    data: [30, 40, 20, 10],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
                }]
            }
        });

        new Chart(cropChart, {
            type: 'bar',
            data: {
                labels: ['Wheat', 'Rice', 'Corn', 'Soybeans'],
                datasets: [{
                    label: 'Yield (tons)',
                    data: [45, 30, 25, 20],
                    backgroundColor: '#36A2EB'
                }]
            }
        });

        new Chart(resourceChart, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Water Usage',
                    data: [65, 70, 80, 75, 85, 90],
                    borderColor: '#4BC0C0'
                }]
            }
        });

        new Chart(marketChart, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Market Price',
                    data: [100, 120, 115, 130],
                    borderColor: '#FF6384'
                }]
            }
        });

        // Update dashboard cards
        document.getElementById('avg-soil-ph').textContent = '7.2';
        document.getElementById('avg-crop-yield').textContent = '92.5%';
        document.getElementById('resource-efficiency').textContent = '88.3%';
        document.getElementById('sustainability-score').textContent = '94.2';

        // Hide loading indicator
        document.getElementById('loading-indicator').style.display = 'none';

    } catch (error) {
        console.error('Dashboard initialization failed:', error);
        alert('Failed to initialize dashboard: ' + error.message);
    }
});

// Add some basic error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    alert('An error occurred: ' + event.error.message);
});