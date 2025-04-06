import { Chart } from 'chart.js/auto';
// Constants
const API_BASE_URL = 'http://localhost:5000/api';

export class FarmDataVisualizer {
    constructor() {
        this.charts = {};
        this.currentData = null;
        this.initializeCharts();
        this.setupEventListeners();
    }

    async initializeCharts() {
        try {
            const response = await fetch('http://localhost:5000/api/farm-data');
            const data = await response.json();
            this.currentData = data;
            this.updateDashboard(data);
            this.createCharts(data);
            this.populateTable(data.data);
            this.populateFilters(data.data);
        } catch (error) {
            console.error('Error fetching farm data:', error);
        }
    }

    updateDashboard(data) {
        document.getElementById('avg-yield').textContent = 
            data.summary.avg_yield.toFixed(2);
        document.getElementById('avg-ph').textContent = 
            data.summary.avg_ph.toFixed(2);
        document.getElementById('total-records').textContent = 
            data.summary.total_records;
    }

    createCharts(data) {
        // Crop Distribution Chart
        this.charts.cropDist = new Chart(
            document.getElementById('crop-distribution-chart'),
            {
                type: 'pie',
                data: {
                    labels: Object.keys(data.summary.crop_distribution),
                    datasets: [{
                        data: Object.values(data.summary.crop_distribution),
                        backgroundColor: [
                            '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B',
                            '#FFC107', '#FF9800', '#FF5722'
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
                            text: 'Crop Distribution'
                        }
                    }
                }
            }
        );

        // Add more charts here...
    }

    populateTable(data, page = 1) {
        const tbody = document.querySelector('#farm-data-table tbody');
        tbody.innerHTML = '';
        
        const itemsPerPage = 10;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        
        data.slice(start, end).forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.soil_type}</td>
                <td>${row.crop_type}</td>
                <td>${row.water_availability}</td>
                <td>${row.soil_ph}</td>
                <td>${row.crop_yield}</td>
                <td>${row.season}</td>
                <td>
                    <button class="btn-view" data-id="${row.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        this.updatePagination(data.length, page, itemsPerPage);
    }

    setupEventListeners() {
        // Filter event listeners
        document.getElementById('soil-filter').addEventListener('change', 
            () => this.applyFilters());
        document.getElementById('crop-filter').addEventListener('change', 
            () => this.applyFilters());
        document.getElementById('yield-filter').addEventListener('change', 
            () => this.applyFilters());
        
        // Export button
        document.getElementById('export-data').addEventListener('click', 
            () => this.exportData());
    }
}

// Initialize the visualizer
document.addEventListener('DOMContentLoaded', () => {
    new FarmDataVisualizer();
});