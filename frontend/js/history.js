document.addEventListener('DOMContentLoaded', function() {
    // Initialize all charts when the page loads
    initYieldComparisonChart();
    initSustainabilityChart();
    initFinancialChart();
    initWeatherImpactChart();
    
    // Set up filter button event listener
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
});
// Constants
const API_BASE_URL = 'http://localhost:5000/api';

// Function to apply filters
function applyFilters() {
    const yearFilter = document.getElementById('year-filter').value;
    const cropFilter = document.getElementById('crop-filter').value;
    
    console.log(`Applying filters - Year: ${yearFilter}, Crop: ${cropFilter}`);
    
    // In a real application, this would fetch filtered data from the server
    // For demo purposes, we'll just simulate a refresh with a timeout
    
    const filterBtn = document.getElementById('apply-filters');
    filterBtn.disabled = true;
    filterBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    setTimeout(() => {
        // Refresh charts with new data
        updateYieldComparisonChart(yearFilter, cropFilter);
        updateSustainabilityChart(yearFilter, cropFilter);
        updateFinancialChart(yearFilter, cropFilter);
        updateWeatherImpactChart(yearFilter, cropFilter);
        
        // Reset button
        filterBtn.disabled = false;
        filterBtn.innerHTML = 'Apply Filters';
        
        // Update table data (in a real app, this would be actual filtered data)
        filterTableData(yearFilter, cropFilter);
    }, 800);
}

// Function to filter table data (simplified for demo)
function filterTableData(year, crop) {
    const rows = document.querySelectorAll('#history-table tbody tr');
    
    rows.forEach(row => {
        const dateCell = row.cells[0].textContent;
        const cropCell = row.cells[2].textContent;
        const yearInDate = dateCell.split(', ')[1];
        
        let visible = true;
        
        if (year !== 'all' && yearInDate !== year) {
            visible = false;
        }
        
        if (crop !== 'all' && cropCell.toLowerCase() !== crop.toLowerCase()) {
            visible = false;
        }
        
        row.style.display = visible ? '' : 'none';
    });
}

// Function to initialize the Yield Comparison Chart
function initYieldComparisonChart() {
    const ctx = document.getElementById('yield-comparison-chart').getContext('2d');
    
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Predicted Yield',
                data: [0, 0, 0, 55, 60, 75, 85, 90, 95, 100, 60, 0],
                borderColor: '#2e7d32',
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Actual Yield',
                data: [0, 0, 0, 52, 65, 78, 88, 95, 102, 98, 57, 0],
                borderColor: '#1565c0',
                backgroundColor: 'rgba(21, 101, 192, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }
        ]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw + ' bu/acre';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Yield (bu/acre)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '2025 (Month)'
                    }
                }
            }
        }
    };
    
    window.yieldChart = new Chart(ctx, config);
}

// Function to update the Yield Comparison Chart with filtered data
function updateYieldComparisonChart(year, crop) {
    // In a real application, this would fetch actual data for the selected filters
    // For demo purposes, we're generating similar but slightly different data
    
    let predictedData, actualData, cropName;
    
    if (crop === 'corn' || crop === 'all') {
        cropName = 'Corn';
        predictedData = [0, 0, 0, 55, 60, 75, 85, 90, 95, 100, 60, 0].map(v => v * (0.9 + Math.random() * 0.2));
        actualData = [0, 0, 0, 52, 65, 78, 88, 95, 102, 98, 57, 0].map(v => v * (0.9 + Math.random() * 0.2));
    } else if (crop === 'soybeans') {
        cropName = 'Soybeans';
        predictedData = [0, 0, 0, 35, 40, 45, 50, 52, 54, 53, 30, 0].map(v => v * (0.9 + Math.random() * 0.2));
        actualData = [0, 0, 0, 33, 42, 48, 51, 55, 56, 52, 28, 0].map(v => v * (0.9 + Math.random() * 0.2));
    } else if (crop === 'wheat') {
        cropName = 'Wheat';
        predictedData = [0, 0, 40, 50, 60, 65, 70, 72, 0, 0, 0, 0].map(v => v * (0.9 + Math.random() * 0.2));
        actualData = [0, 0, 38, 52, 63, 68, 73, 70, 0, 0, 0, 0].map(v => v * (0.9 + Math.random() * 0.2));
    }
    
    window.yieldChart.data.datasets[0].data = predictedData;
    window.yieldChart.data.datasets[1].data = actualData;
    
    if (crop !== 'all') {
        window.yieldChart.options.scales.x.title.text = `${year} - ${cropName} (Month)`;
    } else {
        window.yieldChart.options.scales.x.title.text = `${year} - All Crops (Month)`;
    }
    
    window.yieldChart.update();
}

// Function to initialize the Sustainability Chart
function initSustainabilityChart() {
    const ctx = document.getElementById('sustainability-chart').getContext('2d');
    
    const data = {
        labels: ['2023', '2024', '2025'],
        datasets: [
            {
                label: 'Water Usage (gal/acre)',
                data: [2500, 2100, 1800],
                backgroundColor: '#1565c0',
                yAxisID: 'y'
            },
            {
                label: 'Carbon Footprint (kg CO2/acre)',
                data: [850, 720, 580],
                backgroundColor: '#2e7d32',
                yAxisID: 'y'
            },
            {
                label: 'Sustainability Score',
                data: [6.8, 7.6, 8.4],
                borderColor: '#ff9800',
                backgroundColor: 'rgba(255, 152, 0, 0.2)',
                type: 'line',
                yAxisID: 'y1',
                fill: false,
                tension: 0.4,
                borderWidth: 3
            }
        ]
    };
    
    const config = {
        data: data,
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Usage per Acre'
                    }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    min: 0,
                    max: 10,
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Sustainability Score (0-10)'
                    }
                }
            }
        }
    };
    
    window.sustainabilityChart = new Chart(ctx, config);
}

// Function to update the Sustainability Chart with filtered data
function updateSustainabilityChart(year, crop) {
    // Generate different data based on filters
    let waterData, carbonData, scoreData;
    
    if (crop === 'corn') {
        waterData = [2800, 2400, 2100];
        carbonData = [900, 780, 650];
        scoreData = [6.5, 7.3, 8.1];
    } else if (crop === 'soybeans') {
        waterData = [2100, 1800, 1500];
        carbonData = [750, 630, 520];
        scoreData = [7.2, 7.9, 8.6];
    } else if (crop === 'wheat') {
        waterData = [2300, 1900, 1600];
        carbonData = [800, 680, 550];
        scoreData = [6.9, 7.5, 8.2];
    } else {
        waterData = [2500, 2100, 1800];
        carbonData = [850, 720, 580];
        scoreData = [6.8, 7.6, 8.4];
    }
    
    // Apply small random variations
    window.sustainabilityChart.data.datasets[0].data = waterData.map(v => v * (0.95 + Math.random() * 0.1));
    window.sustainabilityChart.data.datasets[1].data = carbonData.map(v => v * (0.95 + Math.random() * 0.1));
    window.sustainabilityChart.data.datasets[2].data = scoreData.map(v => Math.min(10, Math.max(0, v * (0.98 + Math.random() * 0.04))));
    
    window.sustainabilityChart.update();
}

// Function to initialize the Financial Chart
function initFinancialChart() {
    const ctx = document.getElementById('financial-chart').getContext('2d');
    
    const data = {
        labels: ['2023', '2024', '2025'],
        datasets: [
            {
                label: 'Revenue per Acre',
                data: [1050, 1180, 1245],
                backgroundColor: '#2e7d32',
            },
            {
                label: 'Cost per Acre',
                data: [680, 710, 740],
                backgroundColor: '#c62828',
            }
        ]
    };
    
    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.raw;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount per Acre ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            }
        }
    };
    
    window.financialChart = new Chart(ctx, config);
}

// Function to update the Financial Chart with filtered data
function updateFinancialChart(year, crop) {
    // Generate different data based on filters
    let revenueData, costData;
    
    if (crop === 'corn') {
        revenueData = [1150, 1250, 1340];
        costData = [720, 750, 780];
    } else if (crop === 'soybeans') {
        revenueData = [980, 1120, 1180];
        costData = [650, 680, 710];
    } else if (crop === 'wheat') {
        revenueData = [850, 940, 990];
        costData = [620, 640, 660];
    } else {
        revenueData = [1050, 1180, 1245];
        costData = [680, 710, 740];
    }
    
    // Apply small random variations
    window.financialChart.data.datasets[0].data = revenueData.map(v => v * (0.95 + Math.random() * 0.1));
    window.financialChart.data.datasets[1].data = costData.map(v => v * (0.95 + Math.random() * 0.1));
    
    window.financialChart.update();
}

// Function to initialize the Weather Impact Chart
function initWeatherImpactChart() {
    const ctx = document.getElementById('weather-impact-chart').getContext('2d');
    
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Temperature (°F)',
                data: [28, 32, 45, 58, 68, 78, 85, 82, 74, 60, 45, 32],
                borderColor: '#e65100',
                backgroundColor: 'rgba(230, 81, 0, 0.1)',
                yAxisID: 'y',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Precipitation (in)',
                data: [2.1, 1.8, 2.4, 3.2, 3.8, 4.1, 3.7, 3.5, 2.9, 2.5, 2.2, 2.0],
                borderColor: '#1565c0',
                backgroundColor: 'rgba(21, 101, 192, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Impact Score',
                data: [0, 0, 1, 4, 7, 9, 10, 9, 7, 5, 2, 0],
                borderColor: '#6a1b9a',
                backgroundColor: 'rgba(106, 27, 154, 0)',
                borderWidth: 3,
                borderDash: [5, 5],
                tension: 0.4,
                fill: false,
                yAxisID: 'y2'
            }
        ]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°F)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Precipitation (in)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                y2: {
                    type: 'linear',
                    display: false,
                    min: 0,
                    max: 10
                },
                x: {
                    title: {
                        display: true,
                        text: '2025 (Month)'
                    }
                }
            }
        }
    };
    
    window.weatherChart = new Chart(ctx, config);
}

// Function to update the Weather Impact Chart with filtered data
function updateWeatherImpactChart(year, crop) {
    // Generate different temperature and precipitation data based on year
    let baseTemp, basePrecip, impactScore;
    
    if (year === '2023') {
        baseTemp = [26, 30, 42, 56, 66, 76, 83, 80, 72, 58, 43, 30];
        basePrecip = [1.9, 1.6, 2.2, 3.0, 3.6, 3.9, 3.5, 3.3, 2.7, 2.3, 2.0, 1.8];
        impactScore = [0, 0, 1, 3, 6, 8, 9, 8, 6, 4, 1, 0];
    } else if (year === '2024') {
        baseTemp = [27, 31, 44, 57, 67, 77, 84, 81, 73, 59, 44, 31];
        basePrecip = [2.0, 1.7, 2.3, 3.1, 3.7, 4.0, 3.6, 3.4, 2.8, 2.4, 2.1, 1.9];
        impactScore = [0, 0, 1, 3.5, 6.5, 8.5, 9.5, 8.5, 6.5, 4.5, 1.5, 0];
    } else {
        baseTemp = [28, 32, 45, 58, 68, 78, 85, 82, 74, 60, 45, 32];
        basePrecip = [2.1, 1.8, 2.4, 3.2, 3.8, 4.1, 3.7, 3.5, 2.9, 2.5, 2.2, 2.0];
        impactScore = [0, 0, 1, 4, 7, 9, 10, 9, 7, 5, 2, 0];
    }
    
    // Apply crop-specific adjustments
    if (crop !== 'all') {
        const adjustment = {
            corn: { temp: 1.1, precip: 0.9 },
            soybeans: { temp: 0.95, precip: 1.2 },
            wheat: { temp: 1.0, precip: 0.8 }
        };

        const factor = adjustment[crop] || { temp: 1.0, precip: 1.0 };
        
        baseTemp = baseTemp.map(v => v * factor.temp);
        basePrecip = basePrecip.map(v => v * factor.precip);
        // Adjust impact score based on crop sensitivity
        impactScore = impactScore.map(v => Math.min(10, v * factor.temp * factor.precip));
    }

    // Update chart data
    window.weatherChart.data.datasets[0].data = baseTemp;
    window.weatherChart.data.datasets[1].data = basePrecip;
    window.weatherChart.data.datasets[2].data = impactScore;

    // Update chart title
    window.weatherChart.options.scales.x.title.text = `${year} - ${crop !== 'all' ? crop.charAt(0).toUpperCase() + crop.slice(1) : 'All Crops'} (Month)`;

    // Refresh the chart
    window.weatherChart.update();
}