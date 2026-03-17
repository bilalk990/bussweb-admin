const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building frontend...');
console.log('Current directory:', __dirname);
console.log('Process cwd:', process.cwd());

// In Railway, both projects are in the same workspace
// Check if FastBuss-Admin exists at the workspace root level
const possiblePaths = [
  '../FastBuss-Admin',  // If backend is in subfolder
  './FastBuss-Admin',   // If both are at same level
  '../../FastBuss-Admin' // If nested deeper
];

let frontendPath = null;
for (const p of possiblePaths) {
  const fullPath = path.resolve(__dirname, p);
  console.log(`Checking path: ${fullPath}`);
  if (fs.existsSync(fullPath)) {
    frontendPath = fullPath;
    console.log(`Found frontend at: ${fullPath}`);
    break;
  }
}

if (!frontendPath) {
  console.log('FastBuss-Admin folder not found in any expected location');
  console.log('Available directories:');
  try {
    const parentDir = path.resolve(__dirname, '..');
    const items = fs.readdirSync(parentDir);
    items.forEach(item => {
      const itemPath = path.join(parentDir, item);
      const isDir = fs.statSync(itemPath).isDirectory();
      console.log(`  ${item} ${isDir ? '(directory)' : '(file)'}`);
    });
  } catch (e) {
    console.log('Could not list parent directory');
  }
  console.log('Skipping frontend build');
  process.exit(0);
}

try {
  console.log(`Building frontend from: ${frontendPath}`);
  
  // Change to frontend directory and build
  process.chdir(frontendPath);
  console.log('Installing frontend dependencies...');
  execSync('npm ci', { stdio: 'inherit' });
  
  console.log('Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('Frontend built successfully!');
  
  // Verify dist folder was created
  const distPath = path.join(frontendPath, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('Frontend dist folder created successfully');
    const distFiles = fs.readdirSync(distPath);
    console.log('Dist contents:', distFiles);
  } else {
    console.log('Warning: dist folder not found after build');
  }
  
} catch (error) {
  console.error('Frontend build failed:', error.message);
  console.log('Continuing without frontend build...');
  // Don't fail the entire build, just skip frontend
}