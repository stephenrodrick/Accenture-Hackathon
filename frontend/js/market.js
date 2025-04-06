// Configuration and Constants
const CHART_COLORS = {
    primary: ['#2E7D32', '#1976D2', '#D32F2F', '#FFA000', '#7B1FA2'],
    background: ['rgba(46,125,50,0.1)', 'rgba(25,118,210,0.1)', 'rgba(211,47,47,0.1)'],
    gradients: ['rgba(46,125,50,0.2)', 'rgba(25,118,210,0.2)', 'rgba(211,47,47,0.2)']
};
// Constants
// Removed duplicate declaration of API_BASE_URL

// Enhanced Market Data Structure
const MARKET_DATA = {
    products: {
        Wheat: {
            prices: [280, 285, 290, 288, 295, 292, 298, 300, 297, 305],
            demand: [800, 820, 810, 830, 850, 840, 860, 870, 880, 890],
            supply: [750, 760, 780, 790, 800, 810, 820, 830, 850, 860],
            seasonality: 0.85,
            weatherImpact: 0.7,
            qualityMetrics: {
                protein: 12.5,
                moisture: 13.2,
                gluten: 28.4
            },
            marketShare: 35,
            priceVolatility: 0.12,
            exportDemand: 450,
            domesticDemand: 440,
            storageCapacity: 1200,
            currentStorage: 850,
            transportationCost: 25,
            processingCost: 45
        },
        // Add similar expanded data for Corn and Soybean
    },
    marketIndicators: {
        economic: {
            gdpGrowth: 2.8,
            inflation: 3.2,
            exchangeRate: 1.15,
            consumerConfidence: 72.4,
            agriculturalIndex: 156.8,
            fuelPrices: 3.45,
            interestRates: 4.25
        },
        environmental: {
            rainfall: {
                current: 85,
                forecast: 90,
                historical: 82
            },
            temperature: {
                current: 24,
                forecast: 26,
                historical: 23
            },
            soilMoisture: {
                optimal: 35,
                current: 32
            }
        },
        trade: {
            exportQuotas: {
                Wheat: 1000,
                Corn: 1500,
                Soybean: 800
            },
            importTariffs: {
                Wheat: 5.2,
                Corn: 4.8,
                Soybean: 6.1
            },
            tradeAgreements: [
                {
                    country: 'USA',
                    products: ['Wheat', 'Corn'],
                    preferentialRate: 2.5
                },
                {
                    country: 'Brazil',
                    products: ['Soybean'],
                    preferentialRate: 3.0
                }
            ]
        }
    }
};

// Constants and Configuration
const API_BASE_URL = 'http://localhost:5000/api';

const CHART_CONFIG = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        intersect: false,
        mode: 'index'
    },
    plugins: {
        legend: {
            position: 'top',
            labels: {
                usePointStyle: true,
                padding: 20
            }
        },
        tooltip: {
            backgroundColor: 'rgba(255,255,255,0.9)',
            titleColor: '#000',
            bodyColor: '#666',
            borderColor: '#ddd',
            borderWidth: 1,
            padding: 15,
            usePointStyle: true,
            callbacks: {
                label: function(context) {
                    return `${context.dataset.label}: ${context.parsed.y}${context.dataset.unit || ''}`;
                }
            }
        }
    }
};

// Enhanced initialization
async function initializeCharts() {
    const charts = {
        soilHealth: new Chart(document.getElementById('soil-mixture-chart'), {
            type: 'doughnut',
            data: {
                labels: demoData.charts.soilHealth.labels,
                datasets: [{
                    data: demoData.charts.soilHealth.data,
                    backgroundColor: CHART_COLORS.primary,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                ...CHART_CONFIG,
                cutout: '70%',
                plugins: {
                    ...CHART_CONFIG.plugins,
                    title: {
                        display: true,
                        text: 'Soil Composition Analysis',
                        padding: 20
                    },
                    doughnutlabel: {
                        labels: [{
                            text: 'Total\nSamples',
                            font: { size: '20' }
                        }]
                    }
                }
            }
        }),

        cropPerformance: new Chart(document.getElementById('crop-distribution-chart'), {
            type: 'bar',
            data: {
                labels: demoData.charts.cropPerformance.labels,
                datasets: [{
                    label: 'Current Yield (tons/ha)',
                    data: demoData.charts.cropPerformance.data,
                    backgroundColor: CHART_COLORS.background[0],
                    borderColor: CHART_COLORS.border[0],
                    borderWidth: 2,
                    borderRadius: 5,
                    unit: ' t/ha'
                }]
            },
            options: {
                ...CHART_CONFIG,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false
                        },
                        ticks: {
                            callback: value => `${value}t/ha`
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        }),

        resourceUsage: new Chart(document.getElementById('resource-usage-chart'), {
            type: 'line',
            data: {
                labels: demoData.charts.resourceUsage.labels,
                datasets: [
                    {
                        label: 'Water Usage',
                        data: demoData.charts.resourceUsage.water,
                        borderColor: CHART_COLORS.border[0],
                        backgroundColor: CHART_COLORS.background[0],
                        fill: true,
                        tension: 0.4,
                        unit: 'kL'
                    },
                    {
                        label: 'Fertilizer Usage',
                        data: demoData.charts.resourceUsage.fertilizer,
                        borderColor: CHART_COLORS.border[1],
                        backgroundColor: CHART_COLORS.background[1],
                        fill: true,
                        tension: 0.4,
                        unit: 'kg'
                    }
                ]
            },
            options: {
                ...CHART_CONFIG,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            borderDash: [5, 5]
                        }
                    }
                }
            }
        }),

        marketAnalysis: new Chart(document.getElementById('market-analysis-chart'), {
            type: 'line',
            data: {
                labels: demoData.charts.marketPrices.labels,
                datasets: [{
                    label: 'Market Price Index',
                    data: demoData.charts.marketPrices.prices,
                    borderColor: CHART_COLORS.border[2],
                    backgroundColor: CHART_COLORS.background[2],
                    fill: true,
                    tension: 0.4,
                    unit: ' USD'
                }]
            },
            options: {
                ...CHART_CONFIG,
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            borderDash: [5, 5]
                        },
                        ticks: {
                            callback: value => `$${value}`
                        }
                    }
                }
            }
        })
    };

    // Add real-time updates
    setInterval(() => {
        updateChartsWithRealTimeData(charts);
    }, 5000); // Update every 5 seconds

    return charts;
}

// Real-time data simulation
function updateChartsWithRealTimeData(charts) {
    const now = new Date();
    const timeLabel = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    // Update market analysis with real-time fluctuations
    const lastPrice = charts.marketAnalysis.data.datasets[0].data.slice(-1)[0];
    const newPrice = lastPrice * (1 + (Math.random() - 0.5) * 0.02); // ±2% change

    charts.marketAnalysis.data.labels.push(timeLabel);
    charts.marketAnalysis.data.datasets[0].data.push(newPrice);

    if (charts.marketAnalysis.data.labels.length > 20) {
        charts.marketAnalysis.data.labels.shift();
        charts.marketAnalysis.data.datasets[0].data.shift();
    }

    // Update resource usage with simulated real-time data
    charts.resourceUsage.data.datasets.forEach(dataset => {
        const lastValue = dataset.data.slice(-1)[0];
        const newValue = lastValue * (1 + (Math.random() - 0.5) * 0.05);
        dataset.data.push(Math.max(0, newValue));
        if (dataset.data.length > 20) dataset.data.shift();
    });

    // Update all charts
    Object.values(charts).forEach(chart => chart.update('none'));
}

// Add gradient backgrounds
function addChartGradients(ctx, colors) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    return gradient;
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    setupEventListeners();
});

function initializeMarketDashboard() {
    createMarketTrendsChart();
    createMarketDistributionChart();
    populateMarketDataTable();
    updateMarketInsights();
}

function createMarketTrendsChart() {
    const ctx = document.getElementById('marketTrendsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: MARKET_DATA.dates,
            datasets: Object.entries(MARKET_DATA.products).map(([product, data], index) => ({
                label: product,
                data: data.prices,
                borderColor: CHART_COLORS.primary[index],
                backgroundColor: CHART_COLORS.background[index],
                fill: true,
                tension: 0.4
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Price per Ton (USD)'
                    },
                    ticks: {
                        callback: value => `$${value}`
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Market Price Trends - Last 10 Months'
                },
                tooltip: {
                    callbacks: {
                        label: context => `${context.dataset.label}: $${context.parsed.y}`
                    }
                }
            }
        }
    });
}

function createMarketDistributionChart() {
    const ctx = document.getElementById('marketDistributionChart').getContext('2d');
    const marketShares = calculateMarketShares();
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(marketShares),
            datasets: [{
                data: Object.values(marketShares),
                backgroundColor: CHART_COLORS.primary,
                borderWidth: 2
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
                    text: 'Market Distribution by Product'
                }
            }
        }
    });
}

function populateMarketDataTable() {
    const tbody = document.getElementById('marketDataBody');
    const latestData = getLatestMarketData();
    
    tbody.innerHTML = latestData.map(row => `
        <tr>
            <td>${row.id}</td>
            <td>${row.product}</td>
            <td>$${row.price.toFixed(2)}</td>
            <td>${row.demand}</td>
            <td>${row.supply}</td>
            <td>$${row.competitorPrice.toFixed(2)}</td>
            <td>${row.economicIndicator}</td>
            <td>${row.weatherImpact}</td>
            <td>${row.seasonalFactor}</td>
            <td>
                <span class="trend ${row.trend >= 0 ? 'positive' : 'negative'}">
                    ${row.trend >= 0 ? '↑' : '↓'} ${Math.abs(row.trend)}%
                </span>
            </td>
        </tr>
    `).join('');
}

function updateMarketInsights() {
    const insights = generateMarketInsights();
    const insightList = document.querySelector('.insight-list');
    
    insightList.innerHTML = insights.map(insight => `
        <li class="${insight.type}">
            <i class="fas ${insight.icon}"></i>
            ${insight.text}
        </li>
    `).join('');
}

// Helper Functions
function generateDateLabels(months) {
    const labels = [];
    const date = new Date();
    for (let i = months - 1; i >= 0; i--) {
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleString('default', { month: 'short', year: '2-digit' }));
    }
    return labels;
}

function calculateMarketShares() {
    const total = Object.values(MARKET_DATA.products)
        .reduce((sum, product) => sum + product.demand[product.demand.length - 1], 0);
    
    return Object.fromEntries(
        Object.entries(MARKET_DATA.products)
            .map(([product, data]) => [
                product,
                (data.demand[data.demand.length - 1] / total) * 100
            ])
    );
}

function getLatestMarketData() {
    return Object.entries(MARKET_DATA.products).map(([product, data], index) => ({
        id: `MKT${(index + 1).toString().padStart(3, '0')}`,
        product,
        price: data.prices[data.prices.length - 1],
        demand: data.demand[data.demand.length - 1],
        supply: data.supply[data.supply.length - 1],
        competitorPrice: data.prices[data.prices.length - 1] * 0.98,
        economicIndicator: MARKET_DATA.marketIndicators.economic.gdpGrowth,
        weatherImpact: data.weatherImpact * 100,
        seasonalFactor: data.seasonality * 100,
        trend: calculateTrend(data.prices)
    }));
}

function calculateTrend(prices) {
    const last = prices[prices.length - 1];
    const previous = prices[prices.length - 2];
    return ((last - previous) / previous * 100).toFixed(1);
}

function generateMarketInsights() {
    const latestData = getLatestMarketData();
    return [
        {
            type: 'opportunity',
            icon: 'fa-arrow-trend-up',
            text: `${latestData[0].product} shows highest growth potential at ${latestData[0].trend}%`
        },
        {
            type: 'warning',
            icon: 'fa-triangle-exclamation',
            text: `Supply shortage predicted for ${latestData[1].product} next month`
        },
        {
            type: 'info',
            icon: 'fa-info-circle',
            text: `Market stability index: ${MARKET_DATA.marketIndicators.economic.consumerConfidence}%`
        }
    ];
}

// Add these new analysis functions
function calculateMarketMetrics(product) {
    const data = MARKET_DATA.products[product];
    const prices = data.prices;
    
    return {
        meanPrice: prices.reduce((a, b) => a + b) / prices.length,
        volatility: calculateVolatility(prices),
        trend: calculateTrendStrength(prices),
        supplyDemandRatio: data.supply[data.supply.length - 1] / data.demand[data.demand.length - 1],
        storageUtilization: (data.currentStorage / data.storageCapacity) * 100,
        profitMargin: calculateProfitMargin(data),
        riskScore: calculateRiskScore(data)
    };
}

function calculateVolatility(prices) {
    const mean = prices.reduce((a, b) => a + b) / prices.length;
    const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
    return Math.sqrt(variance) / mean;
}

function calculateTrendStrength(prices) {
    const n = prices.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = prices;
    
    const xy = x.map((xi, i) => xi * y[i]);
    const xx = x.map(xi => xi * xi);
    
    const sumX = x.reduce((a, b) => a + b);
    const sumY = y.reduce((a, b) => a + b);
    const sumXY = xy.reduce((a, b) => a + b);
    const sumXX = xx.reduce((a, b) => a + b);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope / (sumY / n) * 100; // Percentage trend
}

function calculateRiskScore(data) {
    const volatilityWeight = 0.3;
    const supplyDemandWeight = 0.25;
    const weatherImpactWeight = 0.2;
    const storageWeight = 0.15;
    const marketShareWeight = 0.1;
    
    return (
        volatilityWeight * (1 - data.priceVolatility) +
        supplyDemandWeight * (data.supply[data.supply.length - 1] / data.demand[data.demand.length - 1]) +
        weatherImpactWeight * (1 - data.weatherImpact) +
        storageWeight * (data.currentStorage / data.storageCapacity) +
        marketShareWeight * (data.marketShare / 100)
    ) * 100;
}

function generateEnhancedMarketInsights() {
    const insights = [];
    
    // Price Analysis
    Object.entries(MARKET_DATA.products).forEach(([product, data]) => {
        const metrics = calculateMarketMetrics(product);
        
        insights.push({
            type: metrics.trend > 0 ? 'opportunity' : 'warning',
            icon: metrics.trend > 0 ? 'fa-chart-line' : 'fa-chart-line-down',
            title: `${product} Market Analysis`,
            text: `Price trend: ${metrics.trend.toFixed(1)}% | Volatility: ${(metrics.volatility * 100).toFixed(1)}% | Risk Score: ${metrics.riskScore.toFixed(1)}`,
            details: [
                `Supply/Demand Ratio: ${metrics.supplyDemandRatio.toFixed(2)}`,
                `Storage Utilization: ${metrics.storageUtilization.toFixed(1)}%`,
                `Profit Margin: ${metrics.profitMargin.toFixed(1)}%`
            ]
        });
    });

    // Market Environment
    insights.push({
        type: 'info',
        icon: 'fa-globe',
        title: 'Market Environment',
        text: `GDP Growth: ${MARKET_DATA.marketIndicators.economic.gdpGrowth}% | Inflation: ${MARKET_DATA.marketIndicators.economic.inflation}%`,
        details: [
            `Interest Rate: ${MARKET_DATA.marketIndicators.economic.interestRates}%`,
            `Fuel Price: $${MARKET_DATA.marketIndicators.economic.fuelPrices}/gallon`,
            `Agricultural Index: ${MARKET_DATA.marketIndicators.economic.agriculturalIndex}`
        ]
    });

    // Weather Impact
    insights.push({
        type: 'warning',
        icon: 'fa-cloud-rain',
        title: 'Environmental Conditions',
        text: `Current vs Historical Analysis`,
        details: [
            `Rainfall: ${MARKET_DATA.marketIndicators.environmental.rainfall.current}mm vs ${MARKET_DATA.marketIndicators.environmental.rainfall.historical}mm (historical)`,
            `Temperature: ${MARKET_DATA.marketIndicators.environmental.temperature.current}°C vs ${MARKET_DATA.marketIndicators.environmental.temperature.historical}°C (historical)`,
            `Soil Moisture: ${MARKET_DATA.marketIndicators.environmental.soilMoisture.current}% vs ${MARKET_DATA.marketIndicators.environmental.soilMoisture.optimal}% (optimal)`
        ]
    });

    return insights;
}

// Event Listeners
function setupEventListeners() {
    document.querySelectorAll('.chart-filter-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelector('.chart-filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            updateChartPeriod(e.target.textContent);
        });
    });

    document.getElementById('refreshMarketData').addEventListener('click', () => {
        document.querySelector('.refresh-btn i').classList.add('rotating');
        setTimeout(() => {
            updateAllCharts();
            document.querySelector('.refresh-btn i').classList.remove('rotating');
        }, 1000);
    });
}

function exportMarketReport() {
    const report = {
        timestamp: new Date().toISOString(),
        marketSummary: generateMarketSummary(),
        productAnalysis: Object.entries(MARKET_DATA.products).map(([product, data]) => ({
            product,
            metrics: calculateMarketMetrics(product),
            recommendations: generateProductRecommendations(product, data)
        })),
        marketIndicators: MARKET_DATA.marketIndicators,
        insights: generateEnhancedMarketInsights()
    };

    // Convert to CSV or PDF format
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

// Add this to your event listeners
document.getElementById('exportReport').addEventListener('click', exportMarketReport);

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing charts...');
    initializeCharts();
});

function initializeCharts() {
    // Price Trends Chart
    const priceTrendsChart = new Chart(
        document.getElementById('priceTrendsChart'),
        {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Wheat',
                    data: [280, 285, 290, 288, 295, 292],
                    borderColor: '#2E7D32',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );

    // Volume Analysis Chart
    const volumeChart = new Chart(
        document.getElementById('volumeAnalysisChart'),
        {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Trading Volume',
                    data: [1200, 1350, 1250, 1400, 1300, 1450],
                    backgroundColor: '#1976D2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );

    // Supply vs Demand Chart
    const supplyDemandChart = new Chart(
        document.getElementById('supplyDemandChart'),
        {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Supply',
                        data: [750, 760, 780, 790, 800, 810],
                        borderColor: '#2E7D32',
                        fill: false
                    },
                    {
                        label: 'Demand',
                        data: [800, 820, 810, 830, 850, 840],
                        borderColor: '#D32F2F',
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );

    // Market Distribution Chart
    const distributionChart = new Chart(
        document.getElementById('marketDistributionChart'),
        {
            type: 'doughnut',
            data: {
                labels: ['Wheat', 'Corn', 'Soybean', 'Rice'],
                datasets: [{
                    data: [35, 25, 20, 20],
                    backgroundColor: [
                        '#2E7D32',
                        '#1976D2',
                        '#D32F2F',
                        '#FFA000'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );
}

// Add this at the top of market.js
console.log('Market.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing charts...');
    try {
        initializeCharts();
        console.log('Charts initialized successfully');
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
});
