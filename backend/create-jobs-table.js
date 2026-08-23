const mysql = require("mysql2/promise");
require("dotenv").config();

async function createJobsTable() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
            rejectUnauthorized: false
        }
    });

    await db.execute(`
        CREATE TABLE IF NOT EXISTS jobs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            farmer_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            workers_needed INT NOT NULL,
            salary DECIMAL(10,2) NOT NULL,
            start_date DATE NOT NULL,
            status VARCHAR(50) DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (farmer_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✅ Jobs table created successfully!");

    await db.end();
}

createJobsTable().catch(error => {
    console.error("❌ Failed to create jobs table:");
    console.error(error.message);
});