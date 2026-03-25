const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: console.log
});

async function fixBusFares() {
    try {
        // Check for invalid records
        const [invalidRecords] = await sequelize.query(
            "SELECT id, pickup, dropoff FROM bus_fares WHERE pickup = '' OR dropoff = '' OR pickup IS NULL OR dropoff IS NULL"
        );
        
        console.log('Invalid bus_fares records:', invalidRecords.length);
        if (invalidRecords.length > 0) {
            console.log(JSON.stringify(invalidRecords, null, 2));
            
            // Delete invalid records
            await sequelize.query(
                "DELETE FROM bus_fares WHERE pickup = '' OR dropoff = '' OR pickup IS NULL OR dropoff IS NULL"
            );
            console.log('✅ Deleted invalid records');
        }
        
        // Check all remaining records
        const [allRecords] = await sequelize.query("SELECT id, pickup, dropoff FROM bus_fares");
        console.log('\nAll bus_fares records:', allRecords.length);
        console.log(JSON.stringify(allRecords, null, 2));
        
        await sequelize.close();
    } catch (error) {
        console.error('Error:', error);
        await sequelize.close();
        process.exit(1);
    }
}

fixBusFares();
