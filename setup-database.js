const sql = require('mssql');
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

async function setupDatabase() {
    try {
        console.log('🔗 Connecting to Azure SQL Database...');
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        console.log('✅ Connected successfully!');

        console.log('🏗️ Creating servers table...');
        
        // Drop table if exists (for development)
        await pool.request().query(`
            IF OBJECT_ID('servers', 'U') IS NOT NULL
            DROP TABLE servers
        `);

        // Create servers table
        await pool.request().query(`
            CREATE TABLE servers (
                id INT IDENTITY(1,1) PRIMARY KEY,
                estado_start_stop NVARCHAR(50),
                ambiente NVARCHAR(10),
                app_name NVARCHAR(255),
                owner NVARCHAR(255),
                computer_name NVARCHAR(255) NOT NULL,
                resource_group NVARCHAR(255),
                subscription NVARCHAR(255),
                location NVARCHAR(50),
                size NVARCHAR(50),
                schedule NVARCHAR(500),
                created_at DATETIME2 DEFAULT GETDATE(),
                updated_at DATETIME2 DEFAULT GETDATE()
            )
        `);

        console.log('✅ Servers table created successfully!');

        // Create indexes for better performance
        console.log('📊 Creating database indexes...');
        await pool.request().query(`
            CREATE INDEX IX_servers_computer_name ON servers (computer_name)
        `);
        await pool.request().query(`
            CREATE INDEX IX_servers_estado ON servers (estado_start_stop)
        `);
        await pool.request().query(`
            CREATE INDEX IX_servers_ambiente ON servers (ambiente)
        `);
        await pool.request().query(`
            CREATE INDEX IX_servers_app_name ON servers (app_name)
        `);

        console.log('✅ Database indexes created successfully!');

        // Create a trigger to update the updated_at timestamp
        await pool.request().query(`
            CREATE TRIGGER tr_servers_updated_at
            ON servers
            AFTER UPDATE
            AS
            BEGIN
                SET NOCOUNT ON;
                UPDATE servers
                SET updated_at = GETDATE()
                FROM servers
                INNER JOIN inserted ON servers.id = inserted.id
            END
        `);

        console.log('✅ Database trigger created successfully!');

        await pool.close();
        console.log('🎉 Database setup completed successfully!');
        console.log('');
        console.log('📝 Next steps:');
        console.log('1. Run: npm run import-csv');
        console.log('2. Start the server: npm start');
        
    } catch (err) {
        console.error('❌ Database setup failed:', err);
        process.exit(1);
    }
}

// Run the setup
setupDatabase();