const fs = require('fs');
const path = require('path');

// Create dist/main directory if it doesn't exist
const distMainDir = path.join(__dirname, 'dist', 'main');
if (!fs.existsSync(distMainDir)) {
  fs.mkdirSync(distMainDir, { recursive: true });
}

// Copy .js files from src/main to dist/main
const srcMainDir = path.join(__dirname, 'src', 'main');
const files = fs.readdirSync(srcMainDir).filter(file => file.endsWith('.js') || file.endsWith('.d.ts'));

files.forEach(file => {
  const srcPath = path.join(srcMainDir, file);
  const destPath = path.join(distMainDir, file);
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${file} to ${destPath}`);
});
