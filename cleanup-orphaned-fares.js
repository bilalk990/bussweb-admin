const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: console.log
});

async function cleanupOrphanedFares() {
    try {
        // Find bus_fares with invalid pickup or dropoff references
        const [orphanedFares] = await sequelize.query(`
            SELECT bf.id, bf.pickup, bf.dropoff, bf.agency_id
            FROM bus_fares bf
            LEFT JOIN bus_points bp1 ON bf.pickup = bp1.id
            LEFT JOIN bus_points bp2 ON bf.dropoff = bp2.id
            WHERE bp1.id IS NULL OR bp2.id IS NULL
        `);
        
        console.log('Orphaned bus_fares (invalid pickup/dropoff):', orphanedFares.length);
        console.log(JSON.stringify(orphanedFares, null, 2));
        
        if (orphanedFares.length > 0) {
            const orphanedIds = orphanedFares.map(f => f.id);
            await sequelize.query(`DELETE FROM bus_fares WHERE id IN (${orphanedIds.join(',')})`);
            console.log(`✅ Deleted ${orphanedFares.length} orphaned bus_fares`);
        }
        
        // Show remaining valid fares
        const [validFares] = await sequelize.query(`
            SELECT bf.id, bf.pickup, bf.dropoff, bp1.name as pickup_name, bp2.name as dropoff_name
            FROM bus_fares bf
            JOIN bus_points bp1 ON bf.pickup = bp1.id
            JOIN bus_points bp2 ON bf.dropoff = bp2.id
        `);
        
        console.log('\nRemaining valid bus_fares:', validFares.length);
        console.log(JSON.stringify(validFares, null, 2));
        
        await sequelize.close();
    } catch (error) {
        console.error('Error:', error);
        await sequelize.close();
        process.exit(1);
    }
}

cleanupOrphanedFares();
