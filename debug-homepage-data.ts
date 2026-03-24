import { sequelize } from "./src/config/database";
import { QueryTypes } from "sequelize";

async function checkData() {
    try {
        const companies = await sequelize.query("SELECT id, company_name, logo FROM sub_companies", { type: QueryTypes.SELECT });
        console.log("Companies:", JSON.stringify(companies, null, 2));

        const routeCounts = await sequelize.query("SELECT agency_id, COUNT(*) as count FROM bus_routes GROUP BY agency_id", { type: QueryTypes.SELECT });
        console.log("Route Counts:", JSON.stringify(routeCounts, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkData();
