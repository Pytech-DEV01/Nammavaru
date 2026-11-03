import { createHmac } from 'node:crypto'

const maxBodyBytes = 16_384

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

function getAppsScriptUrl(value) {
  try {
    const url = new URL(value)
    if (
      url.protocol === 'https:' &&
      url.hostname === 'script.google.com' &&
      url.pathname.startsWith('/macros/s/') &&
      url.pathname.endsWith('/exec')
    ) {
      return url
    }
  } catch {
    // Report invalid URLs through the same configuration error below.
  }
  return null
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

  const appsScriptUrl = getAppsScriptUrl(process.env.GOOGLE_APPS_SCRIPT_URL)
  const secret = process.env.GOOGLE_APPS_SCRIPT_SECRET
  if (!appsScriptUrl || !secret) {
    return response.status(503).json({
      error: 'Registration storage is not configured. Please contact the organizer.',
    })
  }

  const timestamp = String(Date.now())
  const data = JSON.stringify(registration)
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}.${data}`)
    .digest('hex')

  try {
    const appsScriptResponse = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp, data, signature }),
    })
    const result = await appsScriptResponse.json()

    if (!appsScriptResponse.ok || result.saved !== true) {
      console.error(
        'Could not save registration through Apps Script:',
        result.error ?? `HTTP ${appsScriptResponse.status}`,
      )
      return response.status(502).json({
        error:
          result.error ??
          'Could not save your registration. Check the Apps Script deployment and try again.',
      })
    }

    return response.status(201).json({ saved: true })
  } catch (error) {
    console.error('Could not reach the Google Apps Script deployment:', error.message)
    return response.status(502).json({
      error:
        'Could not reach the Google Sheets service. Check the Apps Script deployment URL and try again.',
    })
  }
}
