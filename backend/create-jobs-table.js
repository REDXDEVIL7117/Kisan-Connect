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
            accepted_by INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (farmer_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            FOREIGN KEY (accepted_by)
                REFERENCES users(id)
                ON DELETE SET NULL
        )
    `);

    // Add accepted_by to an existing jobs table if the table
    // was created by the older version of this script.
    try {
        await db.execute(`
            ALTER TABLE jobs
            ADD COLUMN accepted_by INT NULL
        `);

        await db.execute(`
            ALTER TABLE jobs
            ADD CONSTRAINT fk_jobs_accepted_by
            FOREIGN KEY (accepted_by)
            REFERENCES users(id)
            ON DELETE SET NULL
        `);

        console.log("✅ Added accepted_by column to jobs table.");
    } catch (error) {
        // Column/constraint may already exist.
        console.log("ℹ️ accepted_by already exists or migration was already applied.");
    }

    console.log("✅ Jobs table is ready!");

    await db.end();
}

createJobsTable().catch(error => {
    console.error("❌ Failed to create jobs table:");
    console.error(error.message);
});