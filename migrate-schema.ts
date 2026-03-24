import { connectToDatabase, sequelize } from "./src/config/database";

async function migrate() {
    await connectToDatabase();
    try {
        console.log("Adding columns to users table...");
        await sequelize.query("ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) DEFAULT 'active'");
        await sequelize.query("ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `assigned_bus_id` BIGINT(20) UNSIGNED NULL");

        console.log("Adding columns to vehicule table...");
        await sequelize.query("ALTER TABLE `vehicule` ADD COLUMN IF NOT EXISTS `driver_id` BIGINT(20) UNSIGNED NULL");

        console.log("Migration completed successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await sequelize.close();
    }
}

migrate();
