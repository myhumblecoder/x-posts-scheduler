const fs = require('fs');
const path = require('path');

// Modules to enforce 100% export usage
const modulesToCheck = [
  path.join(__dirname, 'src', 'post_service.js'),
  path.join(__dirname, 'src', 'scheduler.js'),
  path.join(__dirname, 'src', 'oauth.js'),
  path.join(__dirname, 'src', 'media_service.js'),
  path.join(__dirname, 'src', 'history_service.js'),
];

const testsDir = path.join(__dirname, 'tests');
const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.js'));
const testContents = testFiles.map(f => fs.readFileSync(path.join(testsDir, f), 'utf8'));

let failures = 0;

for (const modPath of modulesToCheck) {
  const mod = require(modPath);
  const exports = Object.keys(mod);
  for (const name of exports) {
    // Skip internal helpers prefixed with '_' (test helpers / debug exports)
    if (name.startsWith('_')) continue;
    // Search for usage of name in test files (simple substring search)
    const used = testContents.some(c => c.includes(name));
    if (!used) {
      console.error(`Coverage check failed: exported symbol '${name}' from ${path.basename(modPath)} not referenced in tests`);
      failures++;
    }
  }
}

if (failures > 0) {
  console.error(`${failures} coverage check failures`);
  process.exit(2);
}
console.log('Coverage check passed (exports referenced in tests)');
