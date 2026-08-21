const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

async function compileMasterReport() {
    const workbook = new ExcelJS.Workbook();
    
    // Read the individual workbooks
    const selWb = new ExcelJS.Workbook();
    await selWb.xlsx.readFile(path.join(__dirname, 'selenium-test-results.xlsx'));
    
    const loadWb = new ExcelJS.Workbook();
    await loadWb.xlsx.readFile(path.join(__dirname, 'load-test-results.xlsx'));
    
    const secWb = new ExcelJS.Workbook();
    await secWb.xlsx.readFile(path.join(__dirname, 'security-test-results.xlsx'));

    // Create Exec Summary
    const execSheet = workbook.addWorksheet('Executive Summary');
    execSheet.addRow(['Metric', 'Value']);
    execSheet.addRow(['Total Selenium Tests', selWb.worksheets[0].rowCount - 1]);
    execSheet.addRow(['Total Load Tests', loadWb.worksheets[0].rowCount - 1]);
    execSheet.addRow(['Total Security Tests', secWb.worksheets[0].rowCount - 1]);
    execSheet.addRow(['Overall Status', 'FAIL (due to deliberate test failures injected)']);
    
    // We just write a master file
    await workbook.xlsx.writeFile(path.join(__dirname, 'final-test-suite-report.xlsx'));
    console.log('Master report compiled: final-test-suite-report.xlsx');
}

compileMasterReport().catch(console.error);
