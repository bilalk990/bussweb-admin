const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });
  
  console.log('=== BUS_POINTS ===');
  const [points] = await conn.execute('SELECT id, name, agency_id FROM bus_points LIMIT 20');
  points.forEach(p => console.log(`ID: ${p.id}, Name: ${p.name}, Agency: ${p.agency_id}`));
  
  console.log('\n=== BUS_FARES ===');
  const [fares] = await conn.execute('SELECT id, route_id, agency_id, pickup, dropoff, amount FROM bus_fares LIMIT 10');
  fares.forEach(f => console.log(`ID: ${f.id}, Route: ${f.route_id}, Pickup: ${f.pickup}, Dropoff: ${f.dropoff}, Amount: ${f.amount}`));
  
  console.log('\n=== BUS_SCHEDULES ===');
  const [schedules] = await conn.execute('SELECT id, route_id, bus_id, departure_date, departure_time, status FROM bus_schedules LIMIT 10');
  schedules.forEach(s => console.log(`ID: ${s.id}, Route: ${s.route_id}, Bus: ${s.bus_id}, Date: ${s.departure_date}, Time: ${s.departure_time}, Status: ${s.status}`));
  
  console.log('\n=== NOTIFICATIONS ===');
  const [notifs] = await conn.execute('SELECT id, user_id, title, message, created_at FROM notifications ORDER BY created_at DESC LIMIT 5');
  notifs.forEach(n => console.log(`ID: ${n.id}, User: ${n.user_id}, Title: ${n.title}, Message: ${n.message.substring(0, 50)}`));
  
  await conn.end();
}

main().catch(console.error);
