import { DataService } from './services/dataService.js';
import { dataService } from './services/dataService.js';
// Constants
const API_BASE_URL = 'http://localhost:5000/api';

class Recommendations {
    constructor() {
        this.initialize();
    }

    async initialize() {
        try {
            const [farmData, marketData] = await Promise.all([
                DataService.getFarmData(),
                DataService.getMarketData()
            ]);
            
            this.populateFilters(farmData, marketData);
            this.generateRecommendations(farmData, marketData);
        } catch (error) {
            console.error('Failed to initialize recommendations:', error);
            this.showError('Failed to load recommendations');
        }
    }

    // ... Add recommendation generation methods
}

class RecommendationsManager {
    constructor() {
        this.filters = {
            soilType: '',
            season: ''
        };
        this.initializeEventListeners();
    }

    async initializeEventListeners() {
        // Filter event listeners
        document.getElementById('soil-type').addEventListener('change', (e) => {
            this.filters.soilType = e.target.value;
        });

        document.getElementById('season').addEventListener('change', (e) => {
            this.filters.season = e.target.value;
        });

        document.querySelector('.apply-filters-btn').addEventListener('click', () => {
            this.updateRecommendations();
        });

        // Initial load
        await this.updateRecommendations();
    }

    async updateRecommendations() {
        try {
            const recommendations = await dataService.getRecommendations(this.filters);
            this.updateUI(recommendations);
        } catch (error) {
            this.showError('Failed to fetch recommendations');
        }
    }

    updateUI(data) {
        // Update Quick Stats
        this.updateQuickStats(data.stats);
        
        // Update Recommendations Grid
        this.updateRecommendationsGrid(data.recommendations);
    }

    updateQuickStats(stats) {
        if (stats) {
            document.querySelector('.stat-value:nth-child(1)').textContent = stats.optimalCrops;
            document.querySelector('.stat-value:nth-child(2)').textContent = `${stats.waterSavings}%`;
            document.querySelector('.stat-value:nth-child(3)').textContent = `${stats.yieldIncrease}%`;
        }
    }

    updateRecommendationsGrid(recommendations) {
        if (recommendations?.crops) {
            const cropList = document.querySelector('.crop-list');
            cropList.innerHTML = recommendations.crops
                .map(crop => `
                    <li>
                        <span class="crop-name">${crop.name}</span>
                        <span class="confidence">${crop.confidence}%</span>
                    </li>
                `).join('');
        }

        if (recommendations?.irrigation) {
            const irrigationSchedule = document.querySelector('.irrigation-schedule');
            irrigationSchedule.innerHTML = recommendations.irrigation
                .map(schedule => `
                    <div class="schedule-item">
                        <span class="day">${schedule.days}</span>
                        <span class="amount">${schedule.amount}L/m²</span>
                    </div>
                `).join('');
        }

        if (recommendations?.soilTreatment) {
            const actionList = document.querySelector('.action-list');
            actionList.innerHTML = recommendations.soilTreatment
                .map(action => `
                    <li>
                        <span class="action-name">${action.name}</span>
                        <span class="confidence">${action.confidence}%</span>
                    </li>
                `).join('');
        }
    }

    showError(message) {
        console.error(message);
        alert(message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Recommendations();
    new RecommendationsManager();
    // Load farm data
    loadFarmData();
    
    // Initialize tabs
    initTabs();
    
    // Initialize price trend chart
    initPriceChart();
    
    // Initialize crop card detail buttons
    initDetailButtons();
});

// Function to load farm data from API (simulated)
function loadFarmData() {
    // In a real application, this would be an API call
    // For demo purposes, we'll just set the data directly
    setTimeout(() => {
        document.getElementById('location-display').textContent = 'Location: Midwest, USA';
        document.getElementById('size-display').textContent = 'Farm Size: 320 acres';
        document.getElementById('soil-display').textContent = 'Soil Type: Loam';
    }, 500);
}

// Function to initialize tabs
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to the clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${tabName}-content`).classList.add('active');
        });
    });
}

// Function to initialize price trend chart
function initPriceChart() {
    const ctx = document.getElementById('price-trend-chart').getContext('2d');
    
    // Simulated data for 12 months
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const cornData = [5.50, 5.48, 5.55, 5.60, 5.70, 5.75, 5.80, 5.82, 5.85, 5.90, 5.95, 6.05];
    const soybeanData = [13.10, 13.05, 13.15, 13.20, 13.25, 13.22, 13.20, 13.18, 13.20, 13.25, 13.30, 13.35];
    const wheatData = [7.20, 7.25, 7.30, 7.32, 7.35, 7.40, 7.45, 7.50, 7.55, 7.60, 7.65, 7.70];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Corn ($/bushel)',
                    data: cornData,
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3
                },
                {
                    label: 'Soybeans ($/bushel)',
                    data: soybeanData,
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3
                },
                {
                    label: 'Wheat ($/bushel)',
                    data: wheatData,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Projected Crop Prices (12-Month Forecast)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price ($/bushel)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                }
            }
        }
    });
}

// Function to initialize crop detail buttons
function initDetailButtons() {
    const detailButtons = document.querySelectorAll('.details-btn');
    
    detailButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cropName = this.parentElement.querySelector('h3').textContent;
            showCropDetails(cropName);
        });
    });
}

// Function to show crop details (simulated modal)
function showCropDetails(cropName) {
    // In a real application, this would open a modal with detailed information
    // For demo purposes, we'll just log to console
    console.log(`Showing details for ${cropName}`);
    
    // Create an alert to demonstrate functionality
    alert(`Detailed information for ${cropName} would appear in a modal here.
    
Features would include:
- Detailed planting guidelines
- Pest management recommendations
- Fertilizer recommendations
- Expected yield calculations
- Profit projections
- Historical performance data`);
}

// Function to simulate loading crop recommendations from API
function loadCropRecommendations() {
    // This would fetch data from an API in a real application
    // For demo purposes, the data is already in the HTML
    console.log('Loading crop recommendations...');
    
    // You could implement a loading animation here
    // And then replace the content with the API response
}

// Function to simulate loading farming practices from API
function loadFarmingPractices() {
    // This would fetch data from an API in a real application
    console.log('Loading farming practices...');
    
    // You could implement a loading animation here
    // And then replace the content with the API response
}

// Function to filter recommendations based on criteria
function filterRecommendations(criteria) {
    // This would filter the displayed recommendations based on user criteria
    console.log('Filtering recommendations by:', criteria);
    
    // In a real application, this would show/hide cards or fetch new data
}

// Function to save user preferences
function saveUserPreferences(preferences) {
    // This would save user preferences to backend
    console.log('Saving user preferences:', preferences);
    
    // In a real application, this would send data to a server
    localStorage.setItem('farmopt-preferences', JSON.stringify(preferences));
}

// Function to generate a PDF report (would require additional library)
function generateReport() {
    console.log('Generating PDF report...');
    alert('Report generation feature would download a PDF with your personalized recommendations.');
}