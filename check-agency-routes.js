const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
});

async function checkAgencyRoutes() {
    try {
        // Get test and ANKIT agencies
        const [agencies] = await sequelize.query(
            'SELECT id, agency_name FROM bus_agencies WHERE agency_name LIKE "%test%" OR agency_name LIKE "%ANKIT%"'
        );
        
        console.log('Found agencies:', agencies);
        
        for (const agency of agencies) {
            // Check routes
            const [routes] = await sequelize.query(
                'SELECT id, route_name, origin, destination FROM bus_routes WHERE agency_id = ?',
                { replacements: [agency.id] }
            );
            
            console.log(`\n${agency.agency_name} (ID: ${agency.id}):`);
            console.log(`  Routes: ${routes.length}`);
            if (routes.length > 0) {
                console.log('  Route details:', JSON.stringify(routes, null, 2));
            }
            
            // Check bus_fares
            const [fares] = await sequelize.query(
                'SELECT id, route_id FROM bus_fares WHERE agency_id = ?',
                { replacements: [agency.id] }
            );
            console.log(`  Bus fares: ${fares.length}`);
            
            // Check buses
            const [buses] = await sequelize.query(
                'SELECT id, name FROM buses WHERE agency_id = ?',
                { replacements: [agency.id] }
            );
            console.log(`  Buses: ${buses.length}`);
        }
        
        await sequelize.close();
    } catch (error) {
        console.error('Error:', error);
        await sequelize.close();
        process.exit(1);
    }
}

checkAgencyRoutes();
