const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: console.log
});

async function updateFareTimes() {
    try {
        // Update bus_fares with 00:00:00 times to default times
        await sequelize.query(
            'UPDATE bus_fares SET departure_time = "08:00:00", arrival_time = "16:00:00" WHERE departure_time = "00:00:00" AND arrival_time = "00:00:00"'
        );
        console.log('✅ Updated bus_fares with default times');
        
        // Show all bus_fares
        const [results] = await sequelize.query('SELECT id, route_id, departure_time, arrival_time FROM bus_fares');
        console.log('\nAll bus_fares:', JSON.stringify(results, null, 2));
        
        await sequelize.close();
    } catch (error) {
        console.error('Error:', error);
        await sequelize.close();
        process.exit(1);
    }
}

updateFareTimes();
