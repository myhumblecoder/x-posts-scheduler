// Simple test runner for repository (lightweight)
const fs = require('fs');
const path = require('path');

const testsDir = path.join(__dirname, 'tests');
if (!fs.existsSync(testsDir)) {
  console.error('No tests directory found:', testsDir);
  process.exit(1);
}

const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.js'));
let failures = 0;

for (const file of testFiles) {
  console.log('Running', file);
  try {
    const testModule = require(path.join(testsDir, file));
    if (typeof testModule.run !== 'function') {
      console.error(`Test file ${file} must export a 'run' function`);
      failures++;
      continue;
    }
    testModule.run();
    console.log('✔', file);
  } catch (err) {
    failures++;
    console.error('✖', file, '\n', err.stack || err);
  }
}

if (failures > 0) {
  console.error(`${failures} test(s) failed`);
  process.exit(1);
}
console.log('All tests passed');
