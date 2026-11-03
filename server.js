import 'dotenv/config'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import ExcelJS from 'exceljs'

const root = fileURLToPath(new URL('.', import.meta.url))
const dist = join(root, 'dist')
const workbookPath =
  process.env.REGISTRATION_WORKBOOK_PATH ??
  'C:\\Users\\Vinay V\\Downloads\\NOV08.xlsx'
const port = Number(process.env.PORT ?? 4173)
const apiPort = Number(process.env.API_PORT ?? 3001)
const maxBodyBytes = 16_384

const columns = [
  { header: 'Name', key: 'name', aliases: ['name', 'fullname'] },
  { header: 'Email', key: 'email', aliases: ['email', 'emailaddress'] },
  {
    header: 'Phone Number',
    key: 'phone',
    aliases: ['phone', 'phonenumber', 'phno'],
  },
  { header: 'Location', key: 'location', aliases: ['location'] },
  { header: 'Age', key: 'age', aliases: ['age'] },
]

let writeQueue = Promise.resolve()

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  response.end(JSON.stringify(payload))
}

async function readJsonBody(request) {
  const chunks = []
  let bytesRead = 0

  for await (const chunk of request) {
    bytesRead += chunk.length
    if (bytesRead > maxBodyBytes) {
      const error = new Error('Request body is too large.')
      error.statusCode = 413
      throw error
    }
    chunks.push(chunk)
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    const error = new Error('Request body must be valid JSON.')
    error.statusCode = 400
    throw error
  }
}

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
      new Error('Name and location must each be 1–120 characters.'),
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

async function appendRegistration(registration) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(workbookPath)

  const worksheet =
    workbook.getWorksheet('Sheet1') ??
    workbook.worksheets[0] ??
    workbook.addWorksheet('Registrations')
  const headerRow = worksheet.getRow(1)
  const headerValues = headerRow.values.slice(1)
  const hasHeaders = headerValues.some(
    (value) => value !== null && value !== undefined && String(value).trim(),
  )

  if (!hasHeaders) {
    columns.forEach((column, index) => {
      headerRow.getCell(index + 1).value = column.header
    })
    headerRow.font = { ...headerRow.font, bold: true }
  }

  const columnIndexes = new Map()
  headerRow.eachCell((cell, columnIndex) => {
    const normalizedHeader = String(cell.value ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
    for (const column of columns) {
      if (column.aliases.includes(normalizedHeader)) {
        columnIndexes.set(column.key, columnIndex)
      }
    }
  })

  let nextColumn = Math.max(headerRow.cellCount, worksheet.columnCount) + 1
  for (const column of columns) {
    if (!columnIndexes.has(column.key)) {
      headerRow.getCell(nextColumn).value = column.header
      columnIndexes.set(column.key, nextColumn)
      nextColumn += 1
    }
  }

  const row = worksheet.addRow([])
  for (const column of columns) {
    row.getCell(columnIndexes.get(column.key)).value = registration[column.key]
  }

  await workbook.xlsx.writeFile(workbookPath)
}

async function handleRegistration(request, response) {
  try {
    const registration = validateRegistration(await readJsonBody(request))
    const pendingWrite = writeQueue.then(() => appendRegistration(registration))
    writeQueue = pendingWrite.catch(() => {})
    await pendingWrite
    sendJson(response, 201, { saved: true })
  } catch (error) {
    if (!error.statusCode) {
      console.error('Could not save registration to the workbook:', error)
    }
    sendJson(response, error.statusCode ?? 500, {
      error:
        error.statusCode === 500
          ? 'Could not save your registration. Check that the workbook exists and is closed in Excel, then try again.'
          : error.message,
    })
  }
}

function contentType(path) {
  return (
    {
      '.css': 'text/css; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.ico': 'image/x-icon',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
    }[extname(path)] ?? 'application/octet-stream'
  )
}

async function serveStatic(pathname, response) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname
  const filePath = resolve(dist, `.${normalize(requestedPath)}`)
  if (filePath !== dist && !filePath.startsWith(`${dist}${sep}`)) {
    response.writeHead(400).end('Invalid path.')
    return
  }

  try {
    const file = await readFile(filePath)
    response.writeHead(200, {
      'Content-Type': contentType(filePath),
      'Cache-Control': filePath.endsWith('index.html')
        ? 'no-cache'
        : 'public, max-age=31536000, immutable',
    })
    response.end(file)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
    const index = await readFile(join(dist, 'index.html'))
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    response.end(index)
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`)

  if (url.pathname === '/api/registrations' && request.method === 'POST') {
    await handleRegistration(request, response)
    return
  }

  if (url.pathname.startsWith('/api/')) {
    sendJson(response, 404, { error: 'API route not found.' })
    return
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }

  try {
    await serveStatic(decodeURIComponent(url.pathname), response)
  } catch (error) {
    console.error('Could not serve the frontend:', error)
    response.writeHead(500).end('Could not serve the frontend.')
  }
})

try {
  await stat(workbookPath)
} catch (error) {
  console.error(`Registration workbook is unavailable at "${workbookPath}".`, error)
  process.exitCode = 1
} 

const serveDist = process.argv.includes('--serve-dist')

if (serveDist && process.exitCode !== 1) {
  server.listen(port, '127.0.0.1', () => {
    console.log(`NAMMAVARU server listening at http://127.0.0.1:${port}`)
    console.log(`Registration workbook: ${workbookPath}`)
  })
}

if (!serveDist && process.exitCode !== 1) {
  const apiServer = createServer(async (request, response) => {
    if (
      request.url === '/api/registrations' &&
      request.method === 'POST'
    ) {
      await handleRegistration(request, response)
      return
    }
    sendJson(response, 404, { error: 'API route not found.' })
  })

  if (process.exitCode !== 1) {
    apiServer.listen(apiPort, '127.0.0.1', () => {
      console.log(`Registration API listening at http://127.0.0.1:${apiPort}`)
    })
  }
}
