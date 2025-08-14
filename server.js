const express = require('express');
const sql = require('mssql');
const path = require('path');
const cors = require('cors');
const cron = require('node-cron');
const AzureVMService = require('./azure-service');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Azure SQL Database configuration
const config = {
    user: process.env.DB_USER || 'finopsadmin',
    password: process.env.DB_PASSWORD || 'FinOps2024!',
    server: process.env.DB_SERVER || 'finops-dashboard-sql.database.windows.net',
    database: process.env.DB_NAME || 'finops-dashboard-db',
    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Database connection pool
let poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Connected to Azure SQL Database');
        return pool;
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    });

// Routes

// Serve the main dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Get all servers
app.get('/api/servers', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM servers ORDER BY computer_name');
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching servers:', err);
        res.status(500).json({ error: 'Failed to fetch servers' });
    }
});

// API: Get server statistics
app.get('/api/stats', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT 
                    COUNT(*) as total_servers,
                    SUM(CASE WHEN estado_start_stop = 'Activo' THEN 1 ELSE 0 END) as activos,
                    SUM(CASE WHEN estado_start_stop = 'Agendamento em progresso' THEN 1 ELSE 0 END) as agendamento,
                    SUM(CASE WHEN estado_start_stop = 'Inactivo' THEN 1 ELSE 0 END) as inativos
                FROM servers
            `);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// API: Get environment distribution (only active servers)
app.get('/api/environment-stats', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT 
                    ambiente,
                    COUNT(*) as server_count
                FROM servers 
                WHERE estado_start_stop = 'Activo'
                GROUP BY ambiente
                ORDER BY ambiente
            `);
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching environment stats:', err);
        res.status(500).json({ error: 'Failed to fetch environment statistics' });
    }
});

// API: Get status distribution
app.get('/api/status-stats', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT 
                    estado_start_stop,
                    COUNT(*) as server_count
                FROM servers 
                GROUP BY estado_start_stop
                ORDER BY estado_start_stop
            `);
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching status stats:', err);
        res.status(500).json({ error: 'Failed to fetch status statistics' });
    }
});

// API: Get unique filter values
app.get('/api/filters', async (req, res) => {
    try {
        const pool = await poolPromise;
        
        const [ambientes, aplicacoes, owners] = await Promise.all([
            pool.request().query('SELECT DISTINCT ambiente FROM servers WHERE ambiente IS NOT NULL ORDER BY ambiente'),
            pool.request().query('SELECT DISTINCT app_name FROM servers WHERE app_name IS NOT NULL ORDER BY app_name'),
            pool.request().query('SELECT DISTINCT owner FROM servers WHERE owner IS NOT NULL ORDER BY owner')
        ]);
        
        res.json({
            ambientes: ambientes.recordset.map(r => r.ambiente),
            aplicacoes: aplicacoes.recordset.map(r => r.app_name),
            owners: owners.recordset.map(r => r.owner)
        });
    } catch (err) {
        console.error('Error fetching filters:', err);
        res.status(500).json({ error: 'Failed to fetch filter options' });
    }
});

// API: Search and filter servers
app.post('/api/servers/search', async (req, res) => {
    try {
        const { search, ambiente, app_name, estado, owner } = req.body;
        const pool = await poolPromise;
        
        let query = 'SELECT * FROM servers WHERE 1=1';
        const request = pool.request();
        
        if (search) {
            query += ' AND (computer_name LIKE @search OR app_name LIKE @search OR owner LIKE @search)';
            request.input('search', sql.NVarChar, `%${search}%`);
        }
        
        if (ambiente) {
            query += ' AND ambiente = @ambiente';
            request.input('ambiente', sql.NVarChar, ambiente);
        }
        
        if (app_name) {
            query += ' AND app_name = @app_name';
            request.input('app_name', sql.NVarChar, app_name);
        }
        
        if (estado) {
            query += ' AND estado_start_stop = @estado';
            request.input('estado', sql.NVarChar, estado);
        }
        
        if (owner) {
            query += ' AND owner = @owner';
            request.input('owner', sql.NVarChar, owner);
        }
        
        query += ' ORDER BY computer_name';
        
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error searching servers:', err);
        res.status(500).json({ error: 'Failed to search servers' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Initialize Azure VM Service
const azureService = new AzureVMService();

// API: Sync with Azure VMs
app.get('/api/azure/sync', async (req, res) => {
    try {
        console.log('Starting Azure VM sync...');
        
        // Load existing CSV data first
        const fs = require('fs');
        const csvParser = require('csv-parser');
        const csvData = [];
        
        if (fs.existsSync('./data.csv')) {
            await new Promise((resolve) => {
                fs.createReadStream('./data.csv')
                    .pipe(csvParser({ separator: ';' }))
                    .on('data', (row) => {
                        // Convert CSV headers to our format
                        const processed = {
                            computer_name: row['COMPUTER NAME'] || row.computer_name,
                            estado_start_stop: row['Estado Start/Stop'] || row.estado_start_stop,
                            ambiente: row['Ambiente'] || row.ambiente,
                            app_name: row['App Name'] || row.app_name,
                            owner: row['Owner'] || row.owner,
                            resource_group: row['RESOURCE GROUP'] || row.resource_group,
                            subscription: row['SUBSCRIPTION'] || row.subscription,
                            location: row['LOCATION'] || row.location,
                            size: row['SIZE'] || row.size,
                            schedule: row['Schedule'] || row.schedule
                        };
                        csvData.push(processed);
                    })
                    .on('end', resolve);
            });
        }
        
        // Sync with Azure
        const syncedData = await azureService.syncWithCSV(csvData);
        
        // Save updated data to database
        const pool = await poolPromise;
        
        // Clear existing data
        await pool.request().query('DELETE FROM servers');
        
        // Insert synced data
        for (const vm of syncedData) {
            await pool.request()
                .input('computer_name', sql.NVarChar, vm.computer_name)
                .input('estado_start_stop', sql.NVarChar, vm.estado_start_stop)
                .input('ambiente', sql.NVarChar, vm.ambiente)
                .input('app_name', sql.NVarChar, vm.app_name)
                .input('owner', sql.NVarChar, vm.owner)
                .input('resource_group', sql.NVarChar, vm.resource_group)
                .input('subscription', sql.NVarChar, vm.subscription)
                .input('location', sql.NVarChar, vm.location)
                .input('size', sql.NVarChar, vm.size)
                .input('schedule', sql.NVarChar, vm.schedule)
                .query(`
                    INSERT INTO servers 
                    (computer_name, estado_start_stop, ambiente, app_name, owner, resource_group, subscription, location, size, schedule)
                    VALUES (@computer_name, @estado_start_stop, @ambiente, @app_name, @owner, @resource_group, @subscription, @location, @size, @schedule)
                `);
        }
        
        res.json({
            success: true,
            message: `Successfully synced ${syncedData.length} VMs with Azure`,
            data: syncedData,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Azure sync error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sync with Azure',
            details: error.message
        });
    }
});

// API: Get Azure VMs only (without CSV merge)
app.get('/api/azure/vms', async (req, res) => {
    try {
        console.log('Fetching VMs directly from Azure...');
        const azureVMs = await azureService.getAllVMs();
        
        res.json({
            success: true,
            data: azureVMs,
            count: azureVMs.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Azure VMs fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch Azure VMs',
            details: error.message
        });
    }
});

// API: Test Azure connection
app.get('/api/azure/test', async (req, res) => {
    try {
        const testResult = await azureService.getAllVMs();
        res.json({
            success: true,
            message: 'Azure connection successful',
            vmCount: testResult.length,
            subscriptions: azureService.subscriptions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Azure connection failed',
            details: error.message
        });
    }
});

// Automatic sync setup
if (process.env.ENABLE_AUTO_SYNC === 'true') {
    const syncInterval = process.env.AZURE_SYNC_INTERVAL_MINUTES || 15;
    
    console.log(`🔄 Setting up automatic Azure sync every ${syncInterval} minutes`);
    
    cron.schedule(`*/${syncInterval} * * * *`, async () => {
        console.log('🔄 Starting scheduled Azure sync...');
        try {
            const csvData = []; // In production, load from database or file
            await azureService.syncWithCSV(csvData);
            console.log('✅ Scheduled Azure sync completed');
        } catch (error) {
            console.error('❌ Scheduled Azure sync failed:', error);
        }
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 FinOps Dashboard server running on port ${port}`);
    console.log(`📊 Dashboard available at: http://localhost:${port}`);
    console.log(`🔗 API endpoints available at: http://localhost:${port}/api/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully');
    sql.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received, shutting down gracefully');
    sql.close();
    process.exit(0);
});