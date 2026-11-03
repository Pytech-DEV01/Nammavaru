const HEADERS = [
  'Timestamp',
  'Full name',
  'Email',
  'Phone number',
  'City',
  'Age',
]
const HEADER_ALIASES = {
  timestamp: ['timestamp', 'submittedat', 'createdat'],
  name: ['name', 'fullname'],
  email: ['email', 'emailaddress'],
  phone: ['phone', 'phonenumber', 'phno'],
  location: ['city', 'location'],
  age: ['age'],
}
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000

function authorizeSpreadsheetAccess() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty(
    'GOOGLE_SHEET_ID',
  )
  if (!spreadsheetId) throw new Error('Set the GOOGLE_SHEET_ID script property first.')
  SpreadsheetApp.openById(spreadsheetId).getName()
}

function doPost(event) {
  try {
    const body = JSON.parse(event.postData.contents)
    const secret = PropertiesService.getScriptProperties().getProperty(
      'GOOGLE_APPS_SCRIPT_SECRET',
    )
    const spreadsheetId = PropertiesService.getScriptProperties().getProperty(
      'GOOGLE_SHEET_ID',
    )

    if (!secret || !spreadsheetId) {
      return jsonResponse({
        saved: false,
        error: 'The Google Sheets service is not configured.',
      })
    }

    if (
      typeof body.timestamp !== 'string' ||
      typeof body.data !== 'string' ||
      typeof body.signature !== 'string'
    ) {
      return jsonResponse({ saved: false, error: 'Invalid request.' })
    }

    const timestamp = Number(body.timestamp)
    if (
      !Number.isFinite(timestamp) ||
      Math.abs(Date.now() - timestamp) > MAX_CLOCK_SKEW_MS
    ) {
      return jsonResponse({ saved: false, error: 'Request expired. Try again.' })
    }

    const expectedSignature = hmacHex(
      body.timestamp + '.' + body.data,
      secret,
    )
    if (!constantTimeEquals(expectedSignature, body.signature)) {
      return jsonResponse({ saved: false, error: 'Request authentication failed.' })
    }

    const registration = JSON.parse(body.data)
    if (!isValidRegistration(registration)) {
      return jsonResponse({ saved: false, error: 'Invalid registration details.' })
    }

    const lock = LockService.getScriptLock()
    if (!lock.tryLock(10000)) {
      return jsonResponse({
        saved: false,
        error: 'The registration service is busy. Please try again.',
      })
    }

    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId)
      const sheet =
        spreadsheet.getSheetByName('Registrations') ??
        spreadsheet.getSheets()[0] ??
        spreadsheet.insertSheet('Registrations')
      let lastColumn = sheet.getLastColumn()
      if (lastColumn === 0) {
        sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
        sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
        lastColumn = HEADERS.length
      }

      const currentHeaders = sheet
        .getRange(1, 1, 1, lastColumn)
        .getValues()[0]
      const columnIndexes = new Map()
      currentHeaders.forEach(function (header, index) {
        const normalizedHeader = String(header).toLowerCase().replace(/[^a-z0-9]/g, '')
        for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
          if (aliases.includes(normalizedHeader) && !columnIndexes.has(field)) {
            columnIndexes.set(field, index + 1)
          }
        }
      })

      for (const [field, header] of Object.entries({
        timestamp: 'Timestamp',
        name: 'Full name',
        email: 'Email',
        phone: 'Phone number',
        location: 'City',
        age: 'Age',
      })) {
        if (!columnIndexes.has(field)) {
          lastColumn += 1
          sheet.getRange(1, lastColumn).setValue(header).setFontWeight('bold')
          columnIndexes.set(field, lastColumn)
        }
      }

      const row = Array(lastColumn).fill('')
      row[columnIndexes.get('timestamp') - 1] = new Date()
      row[columnIndexes.get('name') - 1] = safeCellValue(registration.name)
      row[columnIndexes.get('email') - 1] = safeCellValue(registration.email)
      row[columnIndexes.get('phone') - 1] = safeCellValue(registration.phone)
      row[columnIndexes.get('location') - 1] = safeCellValue(registration.location)
      row[columnIndexes.get('age') - 1] = registration.age
      sheet.appendRow(row)
    } finally {
      lock.releaseLock()
    }

    return jsonResponse({ saved: true })
  } catch (error) {
    console.error('Could not save registration to Google Sheets: ' + error.message)
    return jsonResponse({
      saved: false,
      error: 'Could not save your registration. Check the Sheets setup and try again.',
    })
  }
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  )
}

function hmacHex(message, secret) {
  return Utilities.computeHmacSha256Signature(message, secret)
    .map(function (byte) {
      return ('0' + ((byte + 256) % 256).toString(16)).slice(-2)
    })
    .join('')
}

function constantTimeEquals(left, right) {
  if (left.length !== right.length) return false

  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return difference === 0
}

function isValidRegistration(registration) {
  if (!registration || typeof registration !== 'object') return false

  return (
    typeof registration.name === 'string' &&
    registration.name.length > 0 &&
    registration.name.length <= 120 &&
    typeof registration.email === 'string' &&
    registration.email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email) &&
    typeof registration.phone === 'string' &&
    registration.phone.length <= 20 &&
    /^[0-9+().\-\s]+$/.test(registration.phone) &&
    registration.phone.replace(/\D/g, '').length >= 7 &&
    typeof registration.location === 'string' &&
    registration.location.length > 0 &&
    registration.location.length <= 120 &&
    Number.isInteger(registration.age) &&
    registration.age >= 1 &&
    registration.age <= 120
  )
}

function safeCellValue(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value
}
