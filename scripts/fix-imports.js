import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = path.join(__dirname, "..", "dist", "main");

function fixImports(file) {
  const filePath = path.join(distDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Fix relative imports to include .js extension
  content = content.replace(/from ['"](\..*?)(?:\.js)?['"]/g, 'from "$1.js"');

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Fixed imports in ${file}`);
}

// Process all .js files in the dist/main directory
fs.readdirSync(distDir)
  .filter((file) => file.endsWith(".js"))
  .forEach(fixImports);

console.log("Finished fixing imports");
