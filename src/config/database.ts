import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DB_DATABASE || "lexgtdfz_bus";
const dbUser = process.env.DB_USERNAME || "root";
const dbPass = process.env.DB_PASSWORD || "";
const dbHost = process.env.DB_HOST || "127.0.0.1";
const dbPort = parseInt(process.env.DB_PORT || "3306");

export const sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: "mysql",
    logging: false, // Set to console.log to see SQL queries
});

export async function connectToDatabase() {
    try {
        await sequelize.authenticate();
        console.log("Connected To MySQL DB via Sequelize");

        // Manual Schema Initialization
        try {
            await sequelize.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(255) DEFAULT 'user'");
        } catch (e) { }
        try {
            await sequelize.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(255) DEFAULT 'active'");
        } catch (e) { }

        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS token_blacklists (
                    id INT AUTO_INCREMENT PRIMARY KEY, 
                    token TEXT (1000) NOT NULL, 
                    created_at DATETIME NOT NULL, 
                    updated_at DATETIME NOT NULL
                )
            `);
        } catch (e) { }

        try {
            await sequelize.query("ALTER TABLE bus_agencies ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE");
            await sequelize.query("ALTER TABLE bus_agencies ADD COLUMN IF NOT EXISTS created_by BIGINT UNSIGNED");
        } catch (e) { }

        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS bus_schedules (
                    id INT AUTO_INCREMENT PRIMARY KEY, 
                    agency_id INT NOT NULL, 
                    bus_id INT NOT NULL, 
                    route_id INT NOT NULL, 
                    busfare_id INT, 
                    group_id BIGINT, 
                    departure_date DATE NOT NULL, 
                    departure_time TIME NOT NULL, 
                    arrival_time TIME NOT NULL, 
                    status ENUM('scheduled', 'delayed', 'cancelled', 'completed') DEFAULT 'scheduled', 
                    created_at DATETIME NOT NULL, 
                    updated_at DATETIME NOT NULL
                )
            `);
        } catch (e) { }

        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS support_tickets (
                    id INT AUTO_INCREMENT PRIMARY KEY, 
                    user_id INT NOT NULL, 
                    subject VARCHAR(255) NOT NULL, 
                    description TEXT NOT NULL, 
                    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open', 
                    priority ENUM('low', 'medium', 'high') DEFAULT 'medium', 
                    category ENUM('booking', 'payment', 'technical', 'other') NOT NULL, 
                    attachments JSON, 
                    assigned_to INT, 
                    created_at DATETIME NOT NULL, 
                    updated_at DATETIME NOT NULL
                )
            `);
        } catch (e) { }

        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS staff_operations (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    staff_id BIGINT UNSIGNED NOT NULL,
                    sub_company_id BIGINT UNSIGNED NOT NULL,
                    operation_type ENUM('create', 'update', 'delete', 'block', 'unblock') NOT NULL,
                    target_user_id BIGINT UNSIGNED,
                    changes JSON,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
        } catch (e) { }

        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS bus_bookings (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    user_id BIGINT UNSIGNED NOT NULL,
                    bus_schedule_id BIGINT UNSIGNED NOT NULL,
                    agency_id BIGINT UNSIGNED,
                    total_amount DECIMAL(10,2) NOT NULL,
                    status ENUM('confirmed', 'pending', 'cancelled', 'resold') DEFAULT 'pending',
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
        } catch (e) { }

        try {
            await sequelize.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_bus_id BIGINT UNSIGNED");
        } catch (e) { }

        try {
            await sequelize.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(255)");
        } catch (e) { }

        console.log("Database manual sync successful");
    } catch (error) {
        console.error("MySQL connection error:", error);
    }
}

export default sequelize;
