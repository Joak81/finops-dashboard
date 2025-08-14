const sql = require('mssql');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

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
    }
};

async function importCSV() {
    const csvFile = './Status Start&Stop final.csv';
    
    if (!fs.existsSync(csvFile)) {
        console.error('❌ CSV file not found:', csvFile);
        process.exit(1);
    }

    try {
        console.log('🔗 Connecting to Azure SQL Database...');
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        console.log('✅ Connected successfully!');

        console.log('🗑️ Clearing existing data...');
        await pool.request().query('DELETE FROM servers');

        console.log('📁 Reading CSV file:', csvFile);
        const servers = [];
        
        return new Promise((resolve, reject) => {
            fs.createReadStream(csvFile, { encoding: 'utf8' })
                .pipe(csv({ separator: ';' }))
                .on('data', (row) => {
                    // Clean and map CSV headers to database columns
                    const server = {
                        estado_start_stop: row['Estado Start/Stop'] || '',
                        ambiente: row['Ambiente'] || '',
                        app_name: row['App Name'] || '',
                        owner: row['Owner'] || '',
                        computer_name: row['COMPUTER NAME'] || '',
                        resource_group: row['RESOURCE GROUP'] || '',
                        subscription: row['SUBSCRIPTION'] || '',
                        location: row['LOCATION'] || '',
                        size: row['SIZE'] || '',
                        schedule: row['Schedule'] || ''
                    };
                    
                    // Only add if computer_name is not empty
                    if (server.computer_name.trim()) {
                        servers.push(server);
                    }
                })
                .on('end', async () => {
                    try {
                        console.log(`📊 Found ${servers.length} servers to import`);
                        
                        // Import servers in batches
                        const batchSize = 100;
                        let imported = 0;
                        
                        for (let i = 0; i < servers.length; i += batchSize) {
                            const batch = servers.slice(i, i + batchSize);
                            
                            for (const server of batch) {
                                await pool.request()
                                    .input('estado_start_stop', sql.NVarChar, server.estado_start_stop)
                                    .input('ambiente', sql.NVarChar, server.ambiente)
                                    .input('app_name', sql.NVarChar, server.app_name)
                                    .input('owner', sql.NVarChar, server.owner)
                                    .input('computer_name', sql.NVarChar, server.computer_name)
                                    .input('resource_group', sql.NVarChar, server.resource_group)
                                    .input('subscription', sql.NVarChar, server.subscription)
                                    .input('location', sql.NVarChar, server.location)
                                    .input('size', sql.NVarChar, server.size)
                                    .input('schedule', sql.NVarChar, server.schedule)
                                    .query(`
                                        INSERT INTO servers (
                                            estado_start_stop, ambiente, app_name, owner, computer_name,
                                            resource_group, subscription, location, size, schedule
                                        ) VALUES (
                                            @estado_start_stop, @ambiente, @app_name, @owner, @computer_name,
                                            @resource_group, @subscription, @location, @size, @schedule
                                        )
                                    `);
                                imported++;
                            }
                            
                            console.log(`✅ Imported ${imported}/${servers.length} servers...`);
                        }
                        
                        // Get import statistics
                        const stats = await pool.request().query(`
                            SELECT 
                                COUNT(*) as total_servers,
                                COUNT(CASE WHEN estado_start_stop = 'Activo' THEN 1 END) as activos,
                                COUNT(CASE WHEN estado_start_stop = 'Agendamento em progresso' THEN 1 END) as agendamento,
                                COUNT(CASE WHEN estado_start_stop = 'Inactivo' THEN 1 END) as inativos,
                                COUNT(DISTINCT ambiente) as environments,
                                COUNT(DISTINCT app_name) as applications
                            FROM servers
                        `);
                        
                        const summary = stats.recordset[0];
                        
                        await pool.close();
                        
                        console.log('🎉 CSV import completed successfully!');
                        console.log('');
                        console.log('📊 Import Summary:');
                        console.log(`Total Servers: ${summary.total_servers}`);
                        console.log(`Activos: ${summary.activos}`);
                        console.log(`Agendamento em progresso: ${summary.agendamento}`);
                        console.log(`Inativos: ${summary.inativos}`);
                        console.log(`Environments: ${summary.environments}`);
                        console.log(`Applications: ${summary.applications}`);
                        console.log('');
                        console.log('🚀 Ready to start the application: npm start');
                        
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                })
                .on('error', (err) => {
                    reject(err);
                });
        });
        
    } catch (err) {
        console.error('❌ CSV import failed:', err);
        process.exit(1);
    }
}

// Run the import
importCSV();