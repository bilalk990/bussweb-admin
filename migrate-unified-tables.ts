/**
 * Migration: Unify buses + bus_routes + bus_schedules + users tables with admin panel columns
 * Run once: npx ts-node migrate-unified-tables.ts
 *
 * Adds to `buses`:        total_seats, status, driver_id  (makes vin_number nullable)
 * Adds to `bus_routes`:   route_name, adult_price, child_price, distance
 * Adds to `bus_schedules`: departure_bus_station, arrival_bus_station
 * Adds to `users`:        role, status, assigned_bus_id, profile_picture, phone
 */

import { sequelize } from "./src/config/database";

async function colExists(table: string, col: string): Promise<boolean> {
    const [rows] = await sequelize.query(
        `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        { replacements: [table, col] }
    ) as any[];
    return rows[0].cnt > 0;
}

async function migrate() {
    console.log("🔄 Starting unified table migration...\n");

    // ── buses ────────────────────────────────────────────────────────────────
    if (!await colExists("buses", "total_seats")) {
        await sequelize.query("ALTER TABLE `buses` ADD COLUMN `total_seats` INT NOT NULL DEFAULT 40 AFTER `bus_type`");
        console.log("✅ buses.total_seats added");
    } else { console.log("⏭  buses.total_seats already exists"); }

    if (!await colExists("buses", "status")) {
        await sequelize.query("ALTER TABLE `buses` ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'inactive' AFTER `total_seats`");
        console.log("✅ buses.status added");
    } else { console.log("⏭  buses.status already exists"); }

    if (!await colExists("buses", "driver_id")) {
        await sequelize.query("ALTER TABLE `buses` ADD COLUMN `driver_id` BIGINT UNSIGNED NULL DEFAULT NULL AFTER `status`");
        console.log("✅ buses.driver_id added");
    } else { console.log("⏭  buses.driver_id already exists"); }

    // Make vin_number nullable so admin panel doesn't need it
    await sequelize.query("ALTER TABLE `buses` MODIFY `vin_number` VARCHAR(50) NULL DEFAULT NULL");
    console.log("✅ buses.vin_number made nullable");

    // ── bus_routes ───────────────────────────────────────────────────────────
    if (!await colExists("bus_routes", "route_name")) {
        await sequelize.query("ALTER TABLE `bus_routes` ADD COLUMN `route_name` VARCHAR(255) NULL AFTER `agency_id`");
        console.log("✅ bus_routes.route_name added");
    } else { console.log("⏭  bus_routes.route_name already exists"); }

    if (!await colExists("bus_routes", "adult_price")) {
        await sequelize.query("ALTER TABLE `bus_routes` ADD COLUMN `adult_price` DECIMAL(10,2) NULL DEFAULT 0 AFTER `destination`");
        console.log("✅ bus_routes.adult_price added");
    } else { console.log("⏭  bus_routes.adult_price already exists"); }

    if (!await colExists("bus_routes", "child_price")) {
        await sequelize.query("ALTER TABLE `bus_routes` ADD COLUMN `child_price` DECIMAL(10,2) NULL DEFAULT 0 AFTER `adult_price`");
        console.log("✅ bus_routes.child_price added");
    } else { console.log("⏭  bus_routes.child_price already exists"); }

    if (!await colExists("bus_routes", "distance")) {
        await sequelize.query("ALTER TABLE `bus_routes` ADD COLUMN `distance` FLOAT NULL DEFAULT NULL AFTER `child_price`");
        console.log("✅ bus_routes.distance added");
    } else { console.log("⏭  bus_routes.distance already exists"); }

    // ── bus_schedules ────────────────────────────────────────────────────────
    if (!await colExists("bus_schedules", "departure_bus_station")) {
        await sequelize.query("ALTER TABLE `bus_schedules` ADD COLUMN `departure_bus_station` VARCHAR(255) NULL DEFAULT NULL AFTER `arrival_time`");
        console.log("✅ bus_schedules.departure_bus_station added");
    } else { console.log("⏭  bus_schedules.departure_bus_station already exists"); }

    if (!await colExists("bus_schedules", "arrival_bus_station")) {
        await sequelize.query("ALTER TABLE `bus_schedules` ADD COLUMN `arrival_bus_station` VARCHAR(255) NULL DEFAULT NULL AFTER `departure_bus_station`");
        console.log("✅ bus_schedules.arrival_bus_station added");
    } else { console.log("⏭  bus_schedules.arrival_bus_station already exists"); }

    // Make group_id nullable (admin panel doesn't always set it)
    await sequelize.query("ALTER TABLE `bus_schedules` MODIFY `group_id` BIGINT NULL DEFAULT NULL");
    console.log("✅ bus_schedules.group_id made nullable");

    // ── users ────────────────────────────────────────────────────────────────
    if (!await colExists("users", "phone")) {
        await sequelize.query("ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(255) NULL DEFAULT NULL AFTER `password`");
        console.log("✅ users.phone added");
    } else { console.log("⏭  users.phone already exists"); }

    if (!await colExists("users", "profile_picture")) {
        await sequelize.query("ALTER TABLE `users` ADD COLUMN `profile_picture` VARCHAR(255) NULL DEFAULT NULL AFTER `phone`");
        console.log("✅ users.profile_picture added");
    } else { console.log("⏭  users.profile_picture already exists"); }

    // ── bus_points ───────────────────────────────────────────────────────────
    // Ensure agency_id is nullable (admin panel sets it per company)
    if (await colExists("bus_points", "agency_id")) {
        await sequelize.query("ALTER TABLE `bus_points` MODIFY `agency_id` BIGINT UNSIGNED NULL DEFAULT NULL");
        console.log("✅ bus_points.agency_id made nullable");
    }

    // ── bus_fares ────────────────────────────────────────────────────────────
    // Ensure agency_id exists (admin panel needs it to scope fares per company)
    if (!await colExists("bus_fares", "agency_id")) {
        await sequelize.query("ALTER TABLE `bus_fares` ADD COLUMN `agency_id` BIGINT UNSIGNED NULL DEFAULT NULL AFTER `id`");
        console.log("✅ bus_fares.agency_id added");
    } else { console.log("⏭  bus_fares.agency_id already exists"); }

    console.log("\n✅ Migration complete. Tables are now unified.");
    await sequelize.close();
}

migrate().catch(err => {
    console.error("❌ Migration failed:", err.message || err);
    process.exit(1);
});
