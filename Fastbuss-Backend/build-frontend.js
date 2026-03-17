const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building frontend...');
console.log('Current directory:', __dirname);
console.log('Process cwd:', process.cwd());

// In Railway, we need to check the workspace structure
// Railway clones the entire repo, so both projects should be at the same level
const workspaceRoot = path.resolve(__dirname, '..');
console.log('Workspace root:', workspaceRoot);

// List contents of workspace root
try {
  const items = fs.readdirSync(workspaceRoot);
  console.log('Workspace contents:', items);
} catch (e) {
  console.log('Could not list workspace root');
}

// Check if FastBuss-Admin exists at the workspace root level
const frontendPath = path.join(workspaceRoot, 'FastBuss-Admin');
console.log('Checking frontend path:', frontendPath);

if (!fs.existsSync(frontendPath)) {
  console.log('FastBuss-Admin folder not found at expected location');
  console.log('Skipping frontend build - will serve backend only');
  process.exit(0);
}

console.log('Found FastBuss-Admin folder, proceeding with build...');

try {
  // Change to frontend directory
  process.chdir(frontendPath);
  console.log('Changed to frontend directory:', process.cwd());
  
  console.log('Installing frontend dependencies...');
  execSync('npm ci', { stdio: 'inherit' });
  
  console.log('Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Verify dist folder was created
  const distPath = path.join(frontendPath, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Frontend dist folder created successfully');
    const distFiles = fs.readdirSync(distPath);
    console.log('Dist contents:', distFiles);
    
    // Copy dist to backend's expected location
    const backendDistPath = path.join(__dirname, 'dist-frontend');
    if (fs.existsSync(backendDistPath)) {
      fs.rmSync(backendDistPath, { recursive: true, force: true });
    }
    
    // Copy the entire dist folder using Node.js (cross-platform)
    function copyDir(src, dest) {
      fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src, { withFileTypes: true });
      
      for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
    
    copyDir(distPath, backendDistPath);
    console.log('✅ Frontend copied to backend directory');
  } else {
    console.log('❌ Warning: dist folder not found after build');
  }
  
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  console.log('Continuing without frontend build...');
}