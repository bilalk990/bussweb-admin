const { Sequelize } = require('sequelize');
require('dotenv').config();

const s = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST, port: process.env.DB_PORT, dialect: 'mysql', logging: false
});

async function cleanup() {
    try {
        // Delete old routes that belong to agencies 1,2,3 (old test data - Cameroon/Zambia/Kenya)
        const [oldRoutes] = await s.query('SELECT id, agency_id, origin, destination FROM bus_routes WHERE agency_id IN (1,2,3)');
        console.log('Old routes to delete:', JSON.stringify(oldRoutes, null, 2));
        
        if (oldRoutes.length > 0) {
            const ids = oldRoutes.map(r => r.id);
            // Delete related bus_fares first
            await s.query(`DELETE FROM bus_fares WHERE route_id IN (${ids.join(',')})`);
            console.log('✅ Deleted old bus_fares');
            // Delete routes
            await s.query(`DELETE FROM bus_routes WHERE id IN (${ids.join(',')})`);
            console.log('✅ Deleted old routes:', ids);
        }
        
        // Show remaining routes
        const [remaining] = await s.query('SELECT id, agency_id, origin, destination FROM bus_routes ORDER BY id');
        console.log('\nRemaining routes:', JSON.stringify(remaining, null, 2));
        
        await s.close();
    } catch(e) { console.error(e); await s.close(); }
}
cleanup();
