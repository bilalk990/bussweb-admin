const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
});

async function checkTestAgency() {
    try {
        // Find test agency
        const [agencies] = await sequelize.query('SELECT id, agency_name FROM bus_agencies WHERE agency_name LIKE "%test%"');
        console.log('Test agency:', JSON.stringify(agencies, null, 2));
        
        if (agencies.length > 0) {
            const agencyId = agencies[0].id;
            
            // Check routes
            const [routes] = await sequelize.query('SELECT id, route_name, origin, destination FROM bus_routes WHERE agency_id = ?', {
                replacements: [agencyId]
            });
            console.log('\nRoutes for test agency:', JSON.stringify(routes, null, 2));
            
            // Check buses
            const [buses] = await sequelize.query('SELECT id, name, plate_number FROM buses WHERE agency_id = ?', {
                replacements: [agencyId]
            });
            console.log('\nBuses for test agency:', JSON.stringify(buses, null, 2));
            
            // Check bus_fares
            const [fares] = await sequelize.query('SELECT id, route_id, pickup, dropoff FROM bus_fares WHERE agency_id = ?', {
                replacements: [agencyId]
            });
            console.log('\nBus fares for test agency:', JSON.stringify(fares, null, 2));
        }
        
        await sequelize.close();
    } catch (error) {
        console.error('Error:', error);
        await sequelize.close();
        process.exit(1);
    }
}

checkTestAgency();
