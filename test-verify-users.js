const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyAllUsers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USERNAME || 'root',
            database: process.env.DB_DATABASE || 'lexgtdfz_bus',
            password: process.env.DB_PASSWORD || ''
        });
        await connection.execute("UPDATE users SET email_verified_at = NOW() WHERE email_verified_at IS NULL");
        console.log("Verified all users.");
        await connection.end();
    } catch (e) {
        console.error(e);
    }
}
verifyAllUsers();
