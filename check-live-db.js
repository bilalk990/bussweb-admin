const { Sequelize } = require('sequelize');
require('dotenv').config();

const s = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST, port: process.env.DB_PORT, dialect: 'mysql', logging: false
});

async function check() {
    try {
        console.log('DB:', process.env.DB_HOST, process.env.DB_DATABASE);
        
        const [agencies] = await s.query('SELECT id, agency_name FROM bus_agencies ORDER BY id DESC');
        console.log('\nAGENCIES:', JSON.stringify(agencies));
        
        const [routes] = await s.query('SELECT id, route_name, origin, destination, agency_id FROM bus_routes ORDER BY id DESC LIMIT 10');
        console.log('\nROUTES:', JSON.stringify(routes));
        
        const [fares] = await s.query('SELECT bf.id, bf.agency_id, bf.route_id, bf.pickup, bf.dropoff, bp1.name as pickup_name, bp2.name as dropoff_name FROM bus_fares bf LEFT JOIN bus_points bp1 ON bf.pickup=bp1.id LEFT JOIN bus_points bp2 ON bf.dropoff=bp2.id');
        console.log('\nFARES WITH NAMES:', JSON.stringify(fares));
        
        await s.close();
    } catch(e) { console.error(e.message); await s.close(); }
}
check();
