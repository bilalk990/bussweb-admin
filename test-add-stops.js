const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: console.log
});

async function addTestStops() {
    try {
        // Get the latest route
        const [routes] = await sequelize.query('SELECT id, route_name FROM bus_routes ORDER BY id DESC LIMIT 1');
        
        if (routes.length === 0) {
            console.log('No routes found');
            await sequelize.close();
            return;
        }
        
        const routeId = routes[0].id;
        console.log('Adding stops to route:', routes[0]);
        
        // Add test stops
        const stops = [
            {
                route_id: routeId,
                stop_order: 1,
                stop_name: 'Islamabad, Pakistan',
                stop_type: 'intermediate',
                arrival_time: '10:00:00',
                departure_time: '10:15:00',
                stop_duration_minutes: 15,
                latitude: 33.6844,
                longitude: 73.0479,
                is_active: 1
            },
            {
                route_id: routeId,
                stop_order: 2,
                stop_name: 'Lahore, Punjab, Pakistan',
                stop_type: 'intermediate',
                arrival_time: '14:00:00',
                departure_time: '14:30:00',
                stop_duration_minutes: 30,
                latitude: 31.5204,
                longitude: 74.3587,
                is_active: 1
            }
        ];
        
        for (const stop of stops) {
            await sequelize.query(
                `INSERT INTO bus_route_stops (route_id, stop_order, stop_name, stop_type, arrival_time, departure_time, stop_duration_minutes, latitude, longitude, is_active, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                {
                    replacements: [
                        stop.route_id,
                        stop.stop_order,
                        stop.stop_name,
                        stop.stop_type,
                        stop.arrival_time,
                        stop.departure_time,
                        stop.stop_duration_minutes,
                        stop.latitude,
                        stop.longitude,
                        stop.is_active
                    ]
                }
            );
            console.log('✅ Added stop:', stop.stop_name);
        }
        
        // Verify
        const [addedStops] = await sequelize.query('SELECT * FROM bus_route_stops WHERE route_id = ?', {
            replacements: [routeId]
        });
        console.log('\nAdded stops:', JSON.stringify(addedStops, null, 2));
        
        await sequelize.close();
    } catch (error) {
        console.error('Error:', error);
        await sequelize.close();
        process.exit(1);
    }
}

addTestStops();
