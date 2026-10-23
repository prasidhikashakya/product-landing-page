const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { google } = require('googleapis');

const headers = [
  'Order ID', 'Date & Time', 'Customer Name', 'Phone Number', 'Email Address',
  'Exact Location', 'Product Name', 'Quantity', 'Price Per Piece', 'Delivery Fee',
  'Total Price', 'Payment Method', 'Order Status', 'Notes',
];
const widths = [165, 165, 175, 145, 225, 280, 270, 90, 140, 125, 145, 160, 145, 240];

async function main() {
  const { GOOGLE_SHEET_ID: spreadsheetId, GOOGLE_SERVICE_ACCOUNT_EMAIL: client_email,
    GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_TAB_NAME: tabName } = process.env;
  if (!spreadsheetId || !client_email || !GOOGLE_PRIVATE_KEY || !tabName) {
    throw new Error('Set GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_TAB_NAME first.');
  }
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email, private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets(properties(sheetId,title),bandedRanges(bandedRangeId))',
  });
  const sheet = meta.data.sheets?.find((item) => item.properties?.title === tabName);
  if (!sheet) throw new Error(`The tab “${tabName}” was not found in the configured spreadsheet.`);
  const sheetId = sheet.properties.sheetId;
  const headerRange = `'${tabName.replace(/'/g, "''")}'!A1:N1`;
  const current = await sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange });
  const actualHeaders = current.data.values?.[0] || [];
  if (actualHeaders.length && headers.some((header, index) => actualHeaders[index] !== header)) {
    throw new Error('The existing header row does not match the order columns. It was left unchanged.');
  }
  if (!actualHeaders.length) {
    const existingRows = await sheets.spreadsheets.values.get({
      spreadsheetId, range: `'${tabName.replace(/'/g, "''")}'!A2:A1000`,
    });
    if ((existingRows.data.values || []).some((row) => row[0])) {
      throw new Error('The sheet has existing order data but no header. It was left unchanged.');
    }
    await sheets.spreadsheets.values.update({
      spreadsheetId, range: headerRange, valueInputOption: 'RAW', requestBody: { values: [headers] },
    });
  }

  const requests = [
    { updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },
    { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 14 }, cell: { userEnteredFormat: { backgroundColor: { red: 0.659, green: 0.365, blue: 0.471 }, textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP' } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 42 }, fields: 'pixelSize' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 14 }, cell: { userEnteredFormat: { textFormat: { fontFamily: 'Arial', fontSize: 10, foregroundColor: { red: 0.188, green: 0.157, blue: 0.169 } }, verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP' } }, fields: 'userEnteredFormat(textFormat,verticalAlignment,wrapStrategy)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 7, endColumnIndex: 8 }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', numberFormat: { type: 'NUMBER', pattern: '#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,numberFormat)' } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 8, endColumnIndex: 11 }, cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT', numberFormat: { type: 'NUMBER', pattern: '"NPR "#,##0' } } }, fields: 'userEnteredFormat(horizontalAlignment,numberFormat)' } },
    { setBasicFilter: { filter: { range: { sheetId, startRowIndex: 0, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 14 } } } },
    { setDataValidation: { range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 12, endColumnIndex: 13 }, rule: { condition: { type: 'ONE_OF_LIST', values: ['New Order', 'Order Confirmed', 'Order Ongoing', 'Delivered', 'Cancelled'].map((userEnteredValue) => ({ userEnteredValue })) }, showCustomUi: true, strict: true } } },
    ...widths.map((pixelSize, index) => ({ updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: index, endIndex: index + 1 }, properties: { pixelSize }, fields: 'pixelSize' } })),
  ];
  if (!(sheet.bandedRanges || []).length) {
    requests.push({ addBanding: { bandedRange: { range: { sheetId, startRowIndex: 0, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 14 }, rowProperties: { headerColor: { red: 0.659, green: 0.365, blue: 0.471 }, firstBandColor: { red: 1, green: 0.996, blue: 0.988 }, secondBandColor: { red: 1, green: 0.957, blue: 0.969 } } } } });
  }
  // Apply contrast after banding so existing row styles cannot leave order data
  // with white text on the pale blush band background.
  requests.push({ repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 14 }, cell: { userEnteredFormat: { textFormat: { foregroundColor: { red: 0.188, green: 0.157, blue: 0.169 } } } }, fields: 'userEnteredFormat.textFormat.foregroundColor' } });
  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  console.log(`Formatted “${tabName}”: title row, frozen header, filters, COD status dropdown, NPR formatting, banded rows, and readable column widths.`);
}

main().catch((error) => { console.error(error.message || 'Could not format the Google Sheet.'); process.exitCode = 1; });
