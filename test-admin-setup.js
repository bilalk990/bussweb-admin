// Simple test script to verify admin setup endpoint
const https = require('https');

const url = 'https://bussweb-admin-production.up.railway.app/api/v1/auth/setup-admin';

console.log('Testing admin setup endpoint...');
console.log('URL:', url);

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      try {
        const parsed = JSON.parse(data);
        console.log('\n✅ Admin setup successful!');
        console.log('Email:', parsed.email);
        console.log('Password:', parsed.password);
      } catch (e) {
        console.log('Response is not JSON:', data);
      }
    } else {
      console.log('❌ Admin setup failed');
    }
  });
}).on('error', (err) => {
  console.log('❌ Request failed:', err.message);
});