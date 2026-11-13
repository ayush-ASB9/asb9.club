// ASB9 Cohort 01 applications → this Google Sheet.
//
// Paste this whole file into Extensions → Apps Script in the Sheet, then
// deploy it as a web app (Execute as: Me, Who has access: Anyone).
// Each submitted application becomes one row in the "Applications" tab.

const SHEET_NAME = 'Applications'

// Where new-application alerts go. Leave as '' to send them to the Google
// account that owns this script.
const NOTIFY_EMAIL = ''

// Column order in the sheet. Keys match the field ids in src/CohortApplication.tsx.
const COLUMNS = [
  ['submittedAt', 'Submitted at'],
  ['fullName', 'Full name'],
  ['email', 'Email'],
  ['age', 'Age'],
  ['location', 'Country + timezone'],
  ['currentStatus', 'Doing right now'],
  ['links', 'Links'],
  ['guardianName', 'Guardian name'],
  ['guardianEmail', 'Guardian email'],
  ['mode', 'Solo or team'],
  ['teammates', 'Teammates'],
  ['teamStory', 'How the team met'],
  ['bestLink', 'Best thing: link'],
  ['bestWhat', 'Best thing: what they did'],
  ['afterShip', 'After shipping'],
  ['abandoned', 'Abandoned project'],
  ['deepDive', 'Gone deep on'],
  ['belief', 'Contrarian belief'],
  ['shouldntGet', 'Got what they “shouldn’t”'],
  ['problem', '5-year problem'],
  ['success', 'Success in 4 weeks'],
  ['bring', 'Brings to the cohort'],
  ['commit', 'Can commit 6–8 h/week'],
  ['conflicts', 'Conflicts'],
  ['videoLink', 'Video'],
  ['obsession', 'Weird obsession'],
  ['threeAm', 'Thinks about at 3am'],
  ['friendsShocked', 'Friends would be shocked'],
  ['anythingElse', 'Anything else'],
  ['heardFrom', 'Heard about ASB9 from'],
  ['submissionId', 'Submission ID'],
]

const REQUIRED = ['fullName', 'email', 'age', 'submissionId']
const MAX_LENGTH = 5000

function doPost(e) {
  let data
  try {
    data = JSON.parse(e.postData.contents)
  } catch (err) {
    return reply({ ok: false, error: 'invalid_json' })
  }
  if (!data || typeof data !== 'object' || REQUIRED.some((key) => !clean(data[key]))) {
    return reply({ ok: false, error: 'missing_fields' })
  }

  const lock = LockService.getScriptLock()
  lock.waitLock(20000)
  try {
    const sheet = getSheet()
    const id = clean(data.submissionId)
    // A retry after a dropped connection resends the same ID: keep only the first copy.
    const idColumn = COLUMNS.length
    if (sheet.getLastRow() > 1) {
      const existing = sheet
        .getRange(2, idColumn, sheet.getLastRow() - 1, 1)
        .createTextFinder(id)
        .matchEntireCell(true)
        .findNext()
      if (existing) return reply({ ok: true, duplicate: true })
    }
    sheet.appendRow(COLUMNS.map(([key]) => (key === 'submittedAt' ? new Date() : safe(clean(data[key])))))
  } finally {
    lock.releaseLock()
  }
  // The row is already saved, so a failed email never loses an application.
  try {
    notify(data)
  } catch (err) {
    console.error('Application email failed: ' + err)
  }
  return reply({ ok: true })
}

function notify(data) {
  const to = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail()
  const name = clean(data.fullName).replace(/[\r\n]+/g, ' ')
  const applicantEmail = clean(data.email)
  const answered = COLUMNS.filter(([key]) => key !== 'submittedAt' && key !== 'submissionId' && clean(data[key]))
  const text = answered.map(([key, label]) => label + '\n' + clean(data[key])).join('\n\n')
  const html = answered
    .map(([key, label]) => '<p><b>' + escapeHtml(label) + '</b><br>' + escapeHtml(clean(data[key])).replace(/\n/g, '<br>') + '</p>')
    .join('')
  const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl()
  MailApp.sendEmail({
    to: to,
    subject: 'New ASB9 Cohort 01 application: ' + name + ' (' + clean(data.age) + ')',
    body: text + '\n\nAll applications: ' + sheetUrl,
    htmlBody: html + '<p><a href="' + sheetUrl + '">Open all applications</a></p>',
    replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail) ? applicantEmail : undefined,
    name: 'ASB9 Applications',
  })
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

// Lets you open the web app URL in a browser to check it is deployed.
function doGet() {
  return reply({ ok: true, service: 'asb9-cohort-01-applications' })
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(([, label]) => label))
    sheet.setFrozenRows(1)
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold')
  }
  return sheet
}

function clean(value) {
  return typeof value === 'string' ? value.trim().slice(0, MAX_LENGTH) : ''
}

// Stops answers that start with =, +, - or @ from running as spreadsheet formulas.
function safe(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON)
}
