# Skillora Automated Testing Framework

This repository includes a complete automated testing framework for the Skillora web application. 
The framework consists of over 900 automated test scenarios covering End-to-End browser interactions, backend security, and API load testing.

## Prerequisites
- Node.js v20+
- Chrome/Chromium (for local Selenium runs)

## Local Execution Commands

### Setup Environment
First, ensure your environment variables are configured.
\`\`\`bash
cp .env.example .env
npm install exceljs
\`\`\`

### Run Tests
To run specific test categories and generate their respective Excel `.xlsx` reports:

#### 1. Selenium E2E Tests (300+ Scenarios)
\`\`\`bash
node selenium-tests/generate-and-run.js
\`\`\`

#### 2. Load & Performance Tests (300+ Scenarios)
\`\`\`bash
node load-tests/generate-and-run.js
\`\`\`

#### 3. Security Assessments (300+ Scenarios)
\`\`\`bash
node security-tests/generate-and-run.js
\`\`\`

### Compile Master Report
After running the suites above, compile them into the final test suite report:
\`\`\`bash
node compile-master-report.js
\`\`\`

## GitHub Actions Integration
The entire test suite is automatically executed on push and pull requests to the `main` branch. 
The workflow (`.github/workflows/full-test-suite.yml`) provisions the required environments, executes all three test suites concurrently in an matrix, and automatically aggregates the results into downloadable Excel artifacts that can be retrieved directly from the Workflow Run page.
