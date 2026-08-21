const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

const dirs = [
    'selenium-tests',
    'selenium-tests/tests',
    'selenium-tests/config',
    'selenium-tests/utils',
    'selenium-tests/fixtures',
    'selenium-tests/reports',
    'selenium-tests/screenshots',
    'load-tests',
    'load-tests/scripts',
    'load-tests/scenarios',
    'load-tests/reports',
    'security-tests',
    'security-tests/scripts',
    'security-tests/scanners',
    'security-tests/reports',
    'Vulnerability Test Results',
    '.github',
    '.github/workflows'
];

dirs.forEach(dir => {
    const fullPath = path.join(rootDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created ${fullPath}`);
    }
});

// Selenium package.json
const seleniumPkg = {
    name: "skillora-selenium-tests",
    version: "1.0.0",
    scripts: {
        "test": "node generate-and-run.js"
    },
    dependencies: {
        "selenium-webdriver": "^4.19.0",
        "exceljs": "^4.4.0"
    }
};
fs.writeFileSync(path.join(rootDir, 'selenium-tests', 'package.json'), JSON.stringify(seleniumPkg, null, 2));

// Load tests package.json
const loadPkg = {
    name: "skillora-load-tests",
    version: "1.0.0",
    scripts: {
        "test": "node generate-and-run.js"
    },
    dependencies: {
        "exceljs": "^4.4.0"
    }
};
fs.writeFileSync(path.join(rootDir, 'load-tests', 'package.json'), JSON.stringify(loadPkg, null, 2));

// Security tests package.json
const secPkg = {
    name: "skillora-security-tests",
    version: "1.0.0",
    scripts: {
        "test": "node generate-and-run.js"
    },
    dependencies: {
        "exceljs": "^4.4.0"
    }
};
fs.writeFileSync(path.join(rootDir, 'security-tests', 'package.json'), JSON.stringify(secPkg, null, 2));

// .env.example
const envExample = `
BASE_URL=http://localhost:3000
API_URL=http://localhost:3000/api
TEST_EMAIL=test@example.com
TEST_PASSWORD=password123
ADMIN_TEST_EMAIL=admin@example.com
ADMIN_TEST_PASSWORD=adminpass
`;
fs.writeFileSync(path.join(rootDir, '.env.example'), envExample.trim());

console.log('Scaffolding complete.');
