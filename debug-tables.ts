import { connectToDatabase, sequelize } from "./src/config/database";

async function test() {
    await connectToDatabase();
    try {
        const [results]: any = await sequelize.query("SHOW TABLES");
        console.log("Tables in database:");
        results.forEach((row: any) => {
            console.log("- " + Object.values(row)[0]);
        });

        const tablesToInspect = ["users", "vehicule", "bus_schedules", "bus_bookings", "roles", "model_has_roles"];

        for (const table of tablesToInspect) {
            try {
                const [schema]: any = await sequelize.query(`DESCRIBE \`${table}\``);
                console.log(`\n--- Schema for ${table} ---`);
                console.table(schema.map((f: any) => ({
                    Field: f.Field,
                    Type: f.Type,
                    Null: f.Null,
                    Key: f.Key,
                    Default: f.Default
                })));
            } catch (e) {
                console.log(`\nTable ${table} not found or error: `, (e as Error).message);
            }
        }

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await sequelize.close();
    }
}

test();
