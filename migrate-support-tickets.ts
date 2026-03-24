/**
 * Migration: Create support_tickets table
 * Run once: npx ts-node migrate-support-tickets.ts
 */
import { sequelize } from "./src/config/database";

async function tableExists(name: string): Promise<boolean> {
    const [rows] = await sequelize.query(
        `SELECT COUNT(*) as cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        { replacements: [name] }
    ) as any[];
    return rows[0].cnt > 0;
}

async function migrate() {
    console.log("🔄 Creating support_tickets table...");

    if (await tableExists("support_tickets")) {
        console.log("⏭  support_tickets already exists");
        await sequelize.close();
        return;
    }

    await sequelize.query(`
        CREATE TABLE support_tickets (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            subject VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            status ENUM('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
            priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
            category ENUM('booking','payment','technical','other') NOT NULL,
            attachments JSON NULL,
            assigned_to BIGINT UNSIGNED NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("✅ support_tickets table created");
    await sequelize.close();
}

migrate().catch(err => {
    console.error("❌ Migration failed:", err.message || err);
    process.exit(1);
});
