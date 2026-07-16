const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.argv[2] || '.';
const OUTPUT_FILE = 'combined-code.txt';

// File extensions to include
const ALLOWED_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
  '.html',
  '.css',
  '.scss',
  '.md',
  '.env',
  '.yml',
  '.yaml',
  '.xml',
  '.sql',
  '.sh',
  '.txt',
]);

// Directories to ignore
const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.turbo',
  '.idea',
  '.vscode',
  'out',
]);

let output = '';

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        walk(fullPath);
      }
      continue;
    }

    const ext = path.extname(entry.name);

    if (ALLOWED_EXTENSIONS.has(ext) || entry.name === '.env' || entry.name.startsWith('.env.')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');

        output += `========= ${path.relative(ROOT_DIR, fullPath)} =========\n`;
        output += content;
        output += '\n\n';
      } catch (err) {
        console.error(`Failed to read ${fullPath}:`, err.message);
      }
    }
  }
}

walk(ROOT_DIR);

fs.writeFileSync(OUTPUT_FILE, output);

console.log(`Done! Combined code written to ${OUTPUT_FILE}`);
