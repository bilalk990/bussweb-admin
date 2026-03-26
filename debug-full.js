const { Sequelize } = require('sequelize');
require('dotenv').config();

const s = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST, port: process.env.DB_PORT, dialect: 'mysql', logging: false
});

async function debug() {
    try {
        const [agencies] = await s.query('SELECT id, agency_name FROM bus_agencies ORDER BY id DESC');
        console.log('=== AGENCIES ===');
        console.log(JSON.stringify(agencies, null, 2));

        const [routes] = await s.query('SELECT id, route_name, origin, destination, agency_id FROM bus_routes ORDER BY id DESC');
        console.log('\n=== ROUTES ===');
        console.log(JSON.stringify(routes, null, 2));

        const [fares] = await s.query('SELECT id, agency_id, route_id, pickup, dropoff, departure_time, arrival_time FROM bus_fares');
        console.log('\n=== BUS_FARES ===');
        console.log(JSON.stringify(fares, null, 2));

        const [trips] = await s.query('SELECT id, agency_id, route_id, departure_time, arrival_time, status FROM trips ORDER BY id DESC LIMIT 5');
        console.log('\n=== TRIPS (schedules) ===');
        console.log(JSON.stringify(trips, null, 2));

        // Check what agency 9 is
        const [agency9] = await s.query('SELECT * FROM bus_agencies WHERE id = 9');
        console.log('\n=== AGENCY ID 9 ===');
        console.log(JSON.stringify(agency9, null, 2));

        await s.close();
    } catch (e) {
        console.error(e.message);
        await s.close();
    }
}
debug();
