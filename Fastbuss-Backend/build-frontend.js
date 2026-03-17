const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building frontend...');

// Check if FastBuss-Admin exists at different paths
const possiblePaths = [
  '../FastBuss-Admin',
  '../../FastBuss-Admin',
  './FastBuss-Admin'
];

let frontendPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(path.join(__dirname, p))) {
    frontendPath = p;
    break;
  }
}

if (!frontendPath) {
  console.log('FastBuss-Admin folder not found, skipping frontend build');
  process.exit(0);
}

console.log(`Found frontend at: ${frontendPath}`);

try {
  // Install and build frontend
  execSync(`cd ${frontendPath} && npm ci && npm run build`, { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  console.log('Frontend built successfully!');
} catch (error) {
  console.error('Frontend build failed:', error.message);
  // Don't fail the entire build, just skip frontend
}