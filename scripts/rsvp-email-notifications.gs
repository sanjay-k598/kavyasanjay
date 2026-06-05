/**
 * Wedding RSVP email alerts — sends to both Sanjay & Kavya on every form submit.
 *
 * Setup (one time, ~10 min):
 * 1. Open your RSVP form → Responses → Link to Sheets (create spreadsheet if needed)
 * 2. Open that Sheet → Extensions → Apps Script
 * 3. Delete any default code, paste this entire file, Save
 * 4. Replace NOTIFY_EMAILS below with your real Gmail addresses
 * 5. Triggers (clock icon) → Add trigger:
 *    - Function: onFormSubmit
 *    - Event source: From spreadsheet
 *    - Event type: On form submit
 * 6. Save → Authorize when prompted → Submit a test RSVP
 *
 * Column order: adjust NAME_COLUMN / GUESTS_COLUMN if your sheet layout differs.
 * Default assumes: A = Timestamp, B = Full Name, C = Guest Count
 */

const NOTIFY_EMAILS = [
  "sanjaykumar.k598@gmail.com",
  "kavyanagraju23@gmail.com"
];

const NAME_COLUMN = 1; // 0-based index in e.values (column B)
const GUESTS_COLUMN = 2; // column C

function onFormSubmit(e) {
  if (!e || !e.values) return;

  const row = e.values;
  const timestamp = row[0] || new Date().toLocaleString();
  const name = row[NAME_COLUMN] || "—";
  const guests = row[GUESTS_COLUMN] || "—";

  const subject = "New RSVP: " + name;
  const body =
    "New wedding RSVP on kavyasanjay.com\n\n" +
    "Time: " + timestamp + "\n" +
    "Name: " + name + "\n" +
    "Guest count: " + guests + "\n\n" +
    "View all responses in your linked Google Sheet.";

  MailApp.sendEmail(NOTIFY_EMAILS.join(","), subject, body);
}
