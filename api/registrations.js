import { google } from 'googleapis'

const maxBodyBytes = 16_384
const headers = ['Timestamp', 'Full name', 'Email', 'Phone number', 'City', 'Age']

function validateRegistration(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw Object.assign(new Error('Enter valid registration details.'), {
      statusCode: 400,
    })
  }

  const registration = {}
  for (const key of ['name', 'email', 'phone', 'location', 'age']) {
    if (typeof payload[key] !== 'string') {
      throw Object.assign(new Error('Complete all registration fields.'), {
        statusCode: 400,
      })
    }
    registration[key] = payload[key].trim()
  }

  if (
    registration.name.length < 1 ||
    registration.name.length > 120 ||
    registration.location.length < 1 ||
    registration.location.length > 120
  ) {
    throw Object.assign(
      new Error('Name and city must each be 1–120 characters.'),
      { statusCode: 400 },
    )
  }

  if (
    registration.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email)
  ) {
    throw Object.assign(new Error('Enter a valid email address.'), {
      statusCode: 400,
    })
  }

  const digitsInPhone = registration.phone.replace(/\D/g, '').length
  if (
    registration.phone.length > 20 ||
    !/^[0-9+().\-\s]+$/.test(registration.phone) ||
    digitsInPhone < 7
  ) {
    throw Object.assign(new Error('Enter a valid phone number.'), {
      statusCode: 400,
    })
  }

  const age = Number(registration.age)
  if (!Number.isInteger(age) || age < 1 || age > 120) {
    throw Object.assign(new Error('Enter an age between 1 and 120.'), {
      statusCode: 400,
    })
  }

  return { ...registration, age }
}

function getServiceAccount() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) return null

  try {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  } catch {
    throw Object.assign(
      new Error('Google Sheets credentials are not valid JSON.'),
      { statusCode: 500 },
    )
  }
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  let registration
  try {
    const payload =
      typeof request.body === 'string'
        ? JSON.parse(request.body)
        : request.body

    if (Buffer.byteLength(JSON.stringify(payload ?? null)) > maxBodyBytes) {
      return response
        .status(413)
        .json({ error: 'Request body is too large.' })
    }
    registration = validateRegistration(payload)
  } catch (error) {
    return response.status(error.statusCode ?? 400).json({
      error: error.statusCode
        ? error.message
        : 'Request body must be valid JSON.',
    })
  }

  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  let credentials
  try {
    credentials = getServiceAccount()
  } catch (error) {
    console.error(error.message)
    return response.status(500).json({
      error: 'Registration storage is not configured correctly.',
    })
  }

  if (!spreadsheetId || !credentials?.client_email || !credentials?.private_key) {
    return response.status(503).json({
      error: 'Registration storage is not configured. Please contact the organizer.',
    })
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })
    const range = 'Registrations!A1:F1'
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })
    const currentHeaders = headerResponse.data.values?.[0]

    if (!currentHeaders?.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: { values: [headers] },
      })
    } else if (headers.some((header, index) => currentHeaders[index] !== header)) {
      return response.status(500).json({
        error:
          'The Registrations sheet needs these headers in row 1: Timestamp, Full name, Email, Phone number, City, Age.',
      })
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Registrations!A:F',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [
          [
            new Date().toISOString(),
            registration.name,
            registration.email,
            registration.phone,
            registration.location,
            registration.age,
          ],
        ],
      },
    })

    return response.status(201).json({ saved: true })
  } catch (error) {
    console.error('Could not save registration to Google Sheets:', error.message)
    return response.status(500).json({
      error:
        'Could not save your registration. Check the Google Sheets setup and try again.',
    })
  }
}
