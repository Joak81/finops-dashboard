// Global variables
let serversData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 10;
let sortColumn = '';
let sortDirection = 'asc';

// DOM elements
const loadingSpinner = document.getElementById('loadingSpinner');
const searchInput = document.getElementById('searchInput');
const ambienteFilter = document.getElementById('ambienteFilter');
const aplicacaoFilter = document.getElementById('aplicacaoFilter');
const statusFilter = document.getElementById('statusFilter');
const ownerFilter = document.getElementById('ownerFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const serversTableBody = document.getElementById('serversTableBody');
const pagination = document.getElementById('pagination');
const modal = document.getElementById('serverModal');
const modalServerName = document.getElementById('modalServerName');
const modalBody = document.getElementById('modalBody');
const exportBtn = document.getElementById('exportBtn');
const refreshBtn = document.getElementById('refreshBtn');
const syncAzureBtn = document.getElementById('syncAzureBtn');
const azureSyncModal = document.getElementById('azureSyncModal');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadCSVData();
    setupEventListeners();
});

// Load CSV data
async function loadCSVData() {
    try {
        showLoading(true);
        
        // Load the CSV file
        const response = await fetch('data.csv');
        const csvText = await response.text();
        
        // Parse CSV
        serversData = parseCSV(csvText);
        filteredData = [...serversData];
        
        // Initialize the dashboard
        populateFilters();
        updateStatistics();
        renderTable();
        renderCharts();
        
        showLoading(false);
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showError('Erro ao carregar os dados dos servidores. Verifique se o arquivo CSV existe.');
        showLoading(false);
    }
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    // Handle semicolon-separated CSV with UTF-8 BOM
    const headers = lines[0].replace(/^\uFEFF/, '').split(';').map(h => h.trim());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(';').map(v => v.trim());
        if (values.length >= headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                // Create clean property names
                const cleanHeader = header.toLowerCase()
                    .replace(/[^a-z0-9]/g, '_')
                    .replace(/__+/g, '_')
                    .replace(/^_|_$/g, '');
                row[cleanHeader] = values[index] ? values[index].trim() : '';
            });
            data.push(row);
        }
    }
    
    return data;
}

// Parse CSV line (handles commas within quotes)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', debounce(applyFilters, 300));
    
    // Filter functionality
    ambienteFilter.addEventListener('change', applyFilters);
    aplicacaoFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    ownerFilter.addEventListener('change', applyFilters);
    
    // Clear filters
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Export functionality
    exportBtn.addEventListener('click', exportToCSV);
    
    // Refresh functionality
    refreshBtn.addEventListener('click', () => {
        loadCSVData();
    });
    
    // Azure sync functionality
    syncAzureBtn.addEventListener('click', syncWithAzure);
    
    // Table sorting
    document.querySelectorAll('[data-sort]').forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            if (sortColumn === column) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = column;
                sortDirection = 'asc';
            }
            updateSortIndicators();
            renderTable();
        });
    });
    
    // Modal functionality
    const closeBtn = document.querySelector('.close');
    closeBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Populate filter dropdowns
function populateFilters() {
    const ambientes = [...new Set(serversData.map(server => server.ambiente))].filter(a => a).sort();
    const aplicacoes = [...new Set(serversData.map(server => server.app_name))].filter(a => a).sort();
    const owners = [...new Set(serversData.map(server => server.owner))].filter(o => o).sort();
    
    populateSelect(ambienteFilter, ambientes);
    populateSelect(aplicacaoFilter, aplicacoes);
    populateSelect(ownerFilter, owners);
}

// Helper function to populate select elements
function populateSelect(selectElement, options) {
    // Keep the default "Todos/Todas" option
    const defaultOption = selectElement.children[0];
    selectElement.innerHTML = '';
    selectElement.appendChild(defaultOption);
    
    options.forEach(option => {
        if (option && option.trim()) {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        }
    });
}

// Apply filters
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const ambienteValue = ambienteFilter.value;
    const aplicacaoValue = aplicacaoFilter.value;
    const statusValue = statusFilter.value;
    const ownerValue = ownerFilter.value;
    
    filteredData = serversData.filter(server => {
        const matchesSearch = !searchTerm || 
            Object.values(server).some(value => 
                value.toLowerCase().includes(searchTerm)
            );
            
        const matchesAmbiente = !ambienteValue || server.ambiente === ambienteValue;
        const matchesAplicacao = !aplicacaoValue || server.app_name === aplicacaoValue;
        const matchesStatus = !statusValue || server.estado_start_stop === statusValue;
        const matchesOwner = !ownerValue || server.owner === ownerValue;
        
        return matchesSearch && matchesAmbiente && matchesAplicacao && 
               matchesStatus && matchesOwner;
    });
    
    currentPage = 1;
    renderTable();
}

// Clear all filters
function clearFilters() {
    searchInput.value = '';
    ambienteFilter.value = '';
    aplicacaoFilter.value = '';
    statusFilter.value = '';
    ownerFilter.value = '';
    
    filteredData = [...serversData];
    currentPage = 1;
    renderTable();
}

// Update statistics in header
function updateStatistics() {
    const totalServers = serversData.length;
    const activeServers = serversData.filter(s => s.estado_start_stop === 'Agendamento em progresso').length;
    const inactiveServers = serversData.filter(s => s.estado_start_stop === 'Inactivo').length;
    // "Activos" are servers with status "Activo"
    const activosServers = serversData.filter(s => s.estado_start_stop === 'Activo').length;
    
    // Update main statistics
    document.getElementById('totalServers').textContent = totalServers;
    document.getElementById('activosServers').textContent = activosServers;
    document.getElementById('activeServers').textContent = activeServers;
    document.getElementById('inactiveServers').textContent = inactiveServers;
}

// Update sort indicators
function updateSortIndicators() {
    document.querySelectorAll('[data-sort] i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });
    
    const currentHeader = document.querySelector(`[data-sort="${sortColumn}"] i`);
    if (currentHeader) {
        currentHeader.className = sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
}

// Sort data
function sortData(data) {
    if (!sortColumn) return data;
    
    return [...data].sort((a, b) => {
        let aVal = a[sortColumn] || '';
        let bVal = b[sortColumn] || '';
        
        // Convert to lowercase for case-insensitive sorting
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
        
        if (sortDirection === 'asc') {
            return aVal.localeCompare(bVal);
        } else {
            return bVal.localeCompare(aVal);
        }
    });
}

// Render table
function renderTable() {
    const sortedData = sortData(filteredData);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = sortedData.slice(startIndex, endIndex);
    
    serversTableBody.innerHTML = '';
    
    pageData.forEach(server => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong class="computer-name">${server.computer_name}</strong>
            </td>
            <td>
                <span class="status-badge ${getStatusClass(server.estado_start_stop)}">
                    <i class="fas ${getStatusIcon(server.estado_start_stop)}"></i>
                    ${server.estado_start_stop}
                </span>
            </td>
            <td>
                <span class="ambiente-badge ambiente-${server.ambiente ? server.ambiente.toLowerCase() : 'unknown'}">
                    ${server.ambiente || 'N/A'}
                </span>
            </td>
            <td>
                <strong>${server.app_name || 'N/A'}</strong>
            </td>
            <td>${server.owner || 'N/A'}</td>
            <td>
                <span class="subscription-badge">${server.subscription}</span>
            </td>
            <td>
                <small class="schedule-text">${server.schedule || 'Sem agendamento'}</small>
            </td>
            <td>
                <button class="action-btn" onclick="showServerDetails('${server.computer_name}')" title="Ver detalhes">
                    <i class="fas fa-info-circle"></i>
                </button>
            </td>
        `;
        serversTableBody.appendChild(row);
    });
    
    renderPagination();
}

// Get status CSS class
function getStatusClass(status) {
    if (status === 'Activo') return 'status-running';
    if (status === 'Agendamento em progresso') return 'status-running';
    if (status === 'Inactivo') return 'status-stopped';
    return 'status-unknown';
}

// Get status icon
function getStatusIcon(status) {
    if (status === 'Activo') return 'fa-play-circle';
    if (status === 'Agendamento em progresso') return 'fa-clock';
    if (status === 'Inactivo') return 'fa-stop-circle';
    return 'fa-question-circle';
}

// Render pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Show page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span>...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button ${i === currentPage ? 'class="active"' : ''} onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span>...</span>`;
        }
        paginationHTML += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    paginationHTML += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    currentPage = page;
    renderTable();
}

// Show server details modal
function showServerDetails(computerName) {
    const server = serversData.find(s => s.computer_name === computerName);
    if (!server) return;
    
    modalServerName.textContent = `Detalhes: ${server.computer_name}`;
    
    modalBody.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <div class="detail-label">Computer Name</div>
                <div class="detail-value">${server.computer_name}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Estado Start/Stop</div>
                <div class="detail-value">
                    <span class="status-badge ${getStatusClass(server.estado_start_stop)}">
                        <i class="fas ${getStatusIcon(server.estado_start_stop)}"></i>
                        ${server.estado_start_stop}
                    </span>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Ambiente</div>
                <div class="detail-value">
                    <span class="ambiente-badge ambiente-${server.ambiente ? server.ambiente.toLowerCase() : 'unknown'}">
                        ${server.ambiente || 'N/A'}
                    </span>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">App Name</div>
                <div class="detail-value">${server.app_name || 'N/A'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Owner</div>
                <div class="detail-value">${server.owner || 'N/A'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Resource Group</div>
                <div class="detail-value">${server.resource_group}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Subscription</div>
                <div class="detail-value">${server.subscription}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Location</div>
                <div class="detail-value">
                    <i class="fas fa-map-marker-alt"></i>
                    ${server.location}
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Size</div>
                <div class="detail-value">
                    <span class="size-badge">${server.size}</span>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Schedule</div>
                <div class="detail-value">${server.schedule || 'Sem agendamento definido'}</div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
}

// Chart instances for cleanup
let ambienteChartInstance = null;
let statusChartInstance = null;
let aplicacoesChartInstance = null;
let locationChartInstance = null;

// Render charts
function renderCharts() {
    renderAmbienteChart();
    renderStatusChart();
}

// Render ambiente column chart - only active servers
function renderAmbienteChart() {
    const ambienteCount = {};
    // Only count servers with "Activo" status
    serversData.filter(server => server.estado_start_stop === 'Activo').forEach(server => {
        ambienteCount[server.ambiente] = (ambienteCount[server.ambiente] || 0) + 1;
    });
    
    const chartContainer = document.getElementById('ambienteChart');
    chartContainer.innerHTML = '<canvas id="ambienteCanvas" width="300" height="300"></canvas>';
    
    const ctx = document.getElementById('ambienteCanvas').getContext('2d');
    
    // Destroy existing chart if it exists
    if (ambienteChartInstance) {
        ambienteChartInstance.destroy();
    }
    
    const ambienteColors = {
        'QL': '#1e6b3e',  // Dark Green
        'PP': '#28a745',  // Green
        'DR': '#2d5016',  // Very Dark Green
        'DV': '#4a7c59',  // Medium Green
        'PR': '#2e8b57'   // Sea Green
    };
    
    const labels = Object.keys(ambienteCount);
    const data = Object.values(ambienteCount);
    const colors = labels.map(ambiente => ambienteColors[ambiente] || '#6c757d');
    
    ambienteChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Servidores',
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed.y * 100) / total).toFixed(1);
                            return `${context.label}: ${context.parsed.y} servidores (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: 'Segoe UI'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 12,
                            family: 'Segoe UI'
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Render status column chart
function renderStatusChart() {
    const statusCount = {
        'Activo': serversData.filter(s => s.estado_start_stop === 'Activo').length,
        'Agendamento em progresso': serversData.filter(s => s.estado_start_stop === 'Agendamento em progresso').length,
        'Inactivo': serversData.filter(s => s.estado_start_stop === 'Inactivo').length
    };
    
    const chartContainer = document.getElementById('statusChart');
    chartContainer.innerHTML = '<canvas id="statusCanvas" width="300" height="300"></canvas>';
    
    const ctx = document.getElementById('statusCanvas').getContext('2d');
    
    // Destroy existing chart if it exists
    if (statusChartInstance) {
        statusChartInstance.destroy();
    }
    
    const statusColors = {
        'Activo': '#1e6b3e',     // Dark Green
        'Agendamento em progresso': '#28a745',   // Green
        'Inactivo': '#dc3545'    // Red
    };
    
    // Filter out zero values
    const labels = Object.keys(statusCount).filter(key => statusCount[key] > 0);
    const data = labels.map(key => statusCount[key]);
    const colors = labels.map(status => statusColors[status] || '#6c757d');
    
    statusChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Servidores',
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed.y * 100) / total).toFixed(1);
                            return `${context.label}: ${context.parsed.y} servidores (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11,
                            family: 'Segoe UI'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 12,
                            family: 'Segoe UI'
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Render aplicacoes column chart
function renderAplicacoesChart() {
    const aplicacaoCount = {};
    serversData.forEach(server => {
        const appName = server.app_name || 'N/A';
        aplicacaoCount[appName] = (aplicacaoCount[appName] || 0) + 1;
    });
    
    // Get top 5 applications
    const topAplicacoes = Object.entries(aplicacaoCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    const chartContainer = document.getElementById('aplicacoesChart');
    chartContainer.innerHTML = '<canvas id="aplicacoesCanvas" width="300" height="300"></canvas>';
    
    const ctx = document.getElementById('aplicacoesCanvas').getContext('2d');
    
    // Destroy existing chart if it exists
    if (aplicacoesChartInstance) {
        aplicacoesChartInstance.destroy();
    }
    
    // Generate colors for applications - green theme
    const colors = [
        '#1e6b3e',  // Dark Green
        '#2d5016',  // Very Dark Green
        '#4a7c59',  // Medium Green
        '#68a068',  // Light Green
        '#2e8b57'   // Sea Green
    ];
    
    const labels = topAplicacoes.map(([app]) => {
        // Truncate long application names for display
        return app.length > 12 ? app.substring(0, 12) + '...' : app;
    });
    const data = topAplicacoes.map(([, count]) => count);
    const originalLabels = topAplicacoes.map(([app]) => app);
    
    aplicacoesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Servidores',
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: colors.slice(0, labels.length),
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return originalLabels[context[0].dataIndex]; // Full application name in tooltip
                        },
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed.y * 100) / total).toFixed(1);
                            return `Servidores: ${context.parsed.y} (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 10,
                            family: 'Segoe UI'
                        },
                        maxRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 12,
                            family: 'Segoe UI'
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Render location column chart
function renderLocationChart() {
    const locationCount = {};
    serversData.forEach(server => {
        const location = server.location || 'N/A';
        locationCount[location] = (locationCount[location] || 0) + 1;
    });
    
    const chartContainer = document.getElementById('locationChart');
    chartContainer.innerHTML = '<canvas id="locationCanvas" width="300" height="300"></canvas>';
    
    const ctx = document.getElementById('locationCanvas').getContext('2d');
    
    // Destroy existing chart if it exists
    if (locationChartInstance) {
        locationChartInstance.destroy();
    }
    
    // Generate colors for locations - green theme
    const colors = [
        '#1e6b3e',  // Dark Green
        '#2d5016',  // Very Dark Green
        '#4a7c59',  // Medium Green
        '#68a068',  // Light Green
        '#2e8b57'   // Sea Green
    ];
    
    const labels = Object.keys(locationCount);
    const data = Object.values(locationCount);
    
    locationChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Servidores',
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: colors.slice(0, labels.length),
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed.y * 100) / total).toFixed(1);
                            return `Servidores: ${context.parsed.y} (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11,
                            family: 'Segoe UI'
                        },
                        maxRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 12,
                            family: 'Segoe UI'
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Export to CSV
function exportToCSV() {
    const csvContent = convertToCSV(filteredData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `servidores_filtrados_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Convert data to CSV format
function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma
            return value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value;
        });
        csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
}

// Show/hide loading spinner
function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
}

// Show error message
function showError(message) {
    alert(message); // In a real app, you'd want a better error display
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Azure Integration Functions
async function syncWithAzure() {
    try {
        showAzureModal();
        updateSyncStatus('Iniciando sincronização...', 'Conectando ao Azure e buscando Virtual Machines...', 10);
        
        // Disable the sync button
        syncAzureBtn.disabled = true;
        syncAzureBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sincronizando...';
        
        updateSyncStatus('Conectado ao Azure', 'Buscando dados das Virtual Machines...', 30);
        
        const response = await fetch('/api/azure/sync');
        const result = await response.json();
        
        if (result.success) {
            updateSyncStatus('Sincronização completa!', `${result.data.length} VMs sincronizadas com sucesso.`, 100);
            
            // Update the UI with new data
            serversData = result.data;
            filteredData = [...serversData];
            
            populateFilters();
            updateStatistics();
            renderTable();
            renderCharts();
            
            showSyncDetails(result.data);
            
            setTimeout(() => {
                closeAzureModal();
                showSuccessMessage(`✅ Sincronização completa! ${result.data.length} VMs atualizadas.`);
            }, 2000);
            
        } else {
            updateSyncStatus('Erro na sincronização', result.error, 0);
            showSyncError(result.details);
        }
        
    } catch (error) {
        console.error('Azure sync error:', error);
        updateSyncStatus('Erro de conexão', 'Falha ao conectar com o servidor Azure.', 0);
        showSyncError(error.message);
    } finally {
        // Re-enable the sync button
        syncAzureBtn.disabled = false;
        syncAzureBtn.innerHTML = '<i class="fas fa-cloud-download-alt"></i> Sync Azure';
    }
}

function showAzureModal() {
    azureSyncModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Reset modal content
    document.getElementById('syncStatusTitle').textContent = 'Conectando ao Azure...';
    document.getElementById('syncStatusMessage').textContent = 'Por favor aguarde enquanto sincronizamos os dados das Virtual Machines.';
    document.getElementById('syncProgress').style.width = '0%';
    document.getElementById('syncProgressText').textContent = '0%';
    document.getElementById('syncDetails').innerHTML = '';
    
    // Show spinner
    document.querySelector('.sync-spinner').style.display = 'block';
}

function closeAzureModal() {
    azureSyncModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function updateSyncStatus(title, message, progress) {
    document.getElementById('syncStatusTitle').textContent = title;
    document.getElementById('syncStatusMessage').textContent = message;
    document.getElementById('syncProgress').style.width = progress + '%';
    document.getElementById('syncProgressText').textContent = progress + '%';
    
    if (progress === 100) {
        document.querySelector('.sync-spinner').style.display = 'none';
    }
}

function showSyncDetails(vmData) {
    const details = document.getElementById('syncDetails');
    
    // Count VMs by status
    const statusCounts = vmData.reduce((acc, vm) => {
        const status = vm.estado_start_stop || 'Desconhecido';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});
    
    // Count VMs by environment
    const envCounts = vmData.reduce((acc, vm) => {
        const env = vm.ambiente || 'Desconhecido';
        acc[env] = (acc[env] || 0) + 1;
        return acc;
    }, {});
    
    details.innerHTML = `
        <h4>Detalhes da Sincronização</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
            <div>
                <h5>Por Estado:</h5>
                <ul>
                    ${Object.entries(statusCounts).map(([status, count]) => 
                        `<li class="success">${status}: ${count} VMs</li>`
                    ).join('')}
                </ul>
            </div>
            <div>
                <h5>Por Ambiente:</h5>
                <ul>
                    ${Object.entries(envCounts).map(([env, count]) => 
                        `<li class="success">${env}: ${count} VMs</li>`
                    ).join('')}
                </ul>
            </div>
        </div>
        <p style="margin-top: 15px;"><strong>Última sincronização:</strong> ${new Date().toLocaleString('pt-PT')}</p>
    `;
}

function showSyncError(errorDetails) {
    const details = document.getElementById('syncDetails');
    details.innerHTML = `
        <h4>Erro na Sincronização</h4>
        <div class="error" style="margin-top: 15px;">
            <p><strong>Detalhes do erro:</strong></p>
            <p>${errorDetails}</p>
            <p><strong>Possíveis soluções:</strong></p>
            <ul>
                <li>Verificar se está autenticado no Azure (execute: az login)</li>
                <li>Verificar permissões nas subscriptions Azure</li>
                <li>Verificar conectividade de rede</li>
                <li>Contactar o administrador do sistema</li>
            </ul>
        </div>
    `;
    
    document.querySelector('.sync-spinner').style.display = 'none';
}

function showSuccessMessage(message) {
    // Create a temporary success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 600;
        max-width: 400px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Test Azure connection
async function testAzureConnection() {
    try {
        const response = await fetch('/api/azure/test');
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Azure connection successful:', result);
            return true;
        } else {
            console.error('❌ Azure connection failed:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Azure connection error:', error);
        return false;
    }
}

// Close Azure modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === azureSyncModal) {
        closeAzureModal();
    }
});