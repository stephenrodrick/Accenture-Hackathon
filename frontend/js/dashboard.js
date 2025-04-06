// Constants
const API_BASE_URL = 'http://localhost:5000/api';

// Static demo data
const demoData = {
    farmStats: {
        soilHealth: { value: 7.2, change: 3.2 },
        cropYield: { value: 92.5, change: 5.3 },
        resourceEfficiency: { value: 88.3, change: 2.1 },
        sustainabilityScore: { value: 94.2, change: 4.2 }
    },
    charts: {
        soilHealth: {
            labels: ['Clay', 'Loam', 'Silt', 'Sand'],
            data: [30, 40, 15, 15]
        },
        cropPerformance: {
            labels: ['Wheat', 'Corn', 'Soybean', 'Rice'],
            data: [85, 76, 92, 88]
        },
        resourceUsage: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            water: [65, 70, 80, 75, 85, 90],
            fertilizer: [45, 52, 58, 56, 62, 65]
        },
        marketPrices: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            prices: [100, 120, 115, 130]
        }
    },
    farmActivities: [
        { date: '2025-04-06', type: 'Irrigation', details: 'Field A irrigation completed', status: 'Completed', impact: 'Positive' },
        { date: '2025-04-05', type: 'Fertilization', details: 'Applied NPK to Field B', status: 'Completed', impact: 'Positive' },
        { date: '2025-04-04', type: 'Pest Control', details: 'Preventive spraying in Field C', status: 'In Progress', impact: 'Neutral' }
    ],
    farmAnalysis: [
        { id: 'F001', pH: 6.8, moisture: 65, temp: 24, rainfall: 45, crop: 'Wheat', fertilizer: 120, pesticide: 20, yield: 4.5, sustainability: 92 },
        { id: 'F002', pH: 7.1, moisture: 70, temp: 23, rainfall: 50, crop: 'Corn', fertilizer: 150, pesticide: 25, yield: 5.2, sustainability: 88 },
        { id: 'F003', pH: 6.9, moisture: 68, temp: 25, rainfall: 40, crop: 'Soybean', fertilizer: 100, pesticide: 18, yield: 3.8, sustainability: 94 }
    ]
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

async function initializeDashboard() {
    try {
        showLoadingIndicator(true);
        
        // Update stats cards
        updateStatsCards();
        
        // Initialize charts
        initializeCharts();
        
        // Populate tables
        populateFarmActivities();
        populateFarmAnalysis();
        
        // Setup event listeners
        setupEventListeners();
        
        showLoadingIndicator(false);
    } catch (error) {
        console.error('Dashboard initialization failed:', error);
        showError('Failed to initialize dashboard');
    }
}

function updateStatsCards() {
    document.getElementById('avg-soil-ph').textContent = demoData.farmStats.soilHealth.value;
    document.getElementById('avg-crop-yield').textContent = demoData.farmStats.cropYield.value + '%';
    document.getElementById('resource-efficiency').textContent = demoData.farmStats.resourceEfficiency.value + '%';
    document.getElementById('sustainability-score').textContent = demoData.farmStats.sustainabilityScore.value;
}

function initializeCharts() {
    // Soil Health Chart
    new Chart(document.getElementById('soil-mixture-chart'), {
        type: 'doughnut',
        data: {
            labels: demoData.charts.soilHealth.labels,
            datasets: [{
                data: demoData.charts.soilHealth.data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
            }]
        }
    });

    // Crop Performance Chart
    new Chart(document.getElementById('crop-distribution-chart'), {
        type: 'bar',
        data: {
            labels: demoData.charts.cropPerformance.labels,
            datasets: [{
                label: 'Crop Performance Score',
                data: demoData.charts.cropPerformance.data,
                backgroundColor: '#36A2EB'
            }]
        }
    });

    // Resource Usage Chart
    new Chart(document.getElementById('resource-usage-chart'), {
        type: 'line',
        data: {
            labels: demoData.charts.resourceUsage.labels,
            datasets: [
                {
                    label: 'Water Usage',
                    data: demoData.charts.resourceUsage.water,
                    borderColor: '#4BC0C0'
                },
                {
                    label: 'Fertilizer Usage',
                    data: demoData.charts.resourceUsage.fertilizer,
                    borderColor: '#FF6384'
                }
            ]
        }
    });

    // Market Analysis Chart
    new Chart(document.getElementById('market-analysis-chart'), {
        type: 'line',
        data: {
            labels: demoData.charts.marketPrices.labels,
            datasets: [{
                label: 'Market Price Trend',
                data: demoData.charts.marketPrices.prices,
                borderColor: '#FFCE56'
            }]
        }
    });
}

function populateFarmActivities() {
    const tbody = document.getElementById('farm-data-body');
    tbody.innerHTML = demoData.farmActivities.map(activity => `
        <tr>
            <td>${activity.date}</td>
            <td>${activity.type}</td>
            <td>${activity.details}</td>
            <td>${activity.status}</td>
            <td>${activity.impact}</td>
            <td>
                <button class="action-btn"><i class="fas fa-edit"></i></button>
                <button class="action-btn"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function populateFarmAnalysis() {
    const tbody = document.getElementById('farmDataBody');
    tbody.innerHTML = demoData.farmAnalysis.map(data => `
        <tr>
            <td>${data.id}</td>
            <td>${data.pH}</td>
            <td>${data.moisture}</td>
            <td>${data.temp}</td>
            <td>${data.rainfall}</td>
            <td>${data.crop}</td>
            <td>${data.fertilizer}</td>
            <td>${data.pesticide}</td>
            <td>${data.yield}</td>
            <td>
                <div class="sustainability-score" style="--score: ${data.sustainability}%"
                     data-score="${data.sustainability}%">
                </div>
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    // Crop filter
    document.getElementById('cropTypeFilter').addEventListener('change', function(e) {
        const selectedCrop = e.target.value;
        const filteredData = selectedCrop 
            ? demoData.farmAnalysis.filter(data => data.crop === selectedCrop)
            : demoData.farmAnalysis;
        populateFarmAnalysisWithData(filteredData);
    });

    // Refresh button
    document.getElementById('refreshData').addEventListener('click', () => {
        showLoadingIndicator(true);
        setTimeout(() => {
            initializeDashboard();
            showLoadingIndicator(false);
        }, 1000);
    });
}

function showLoadingIndicator(show) {
    const loader = document.getElementById('loading-indicator');
    loader.style.display = show ? 'block' : 'none';
}

function showError(message) {
    alert(message);
}