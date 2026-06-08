# RSVP with Google Forms (your Gmail)

Guest RSVPs on your website are saved in **Google Forms → Google Sheets**, tied to the Google account you use to create the form (your personal Gmail).

## 1. Create the form (5 minutes)

1. Sign in to **[Google Forms](https://forms.google.com)** with your **personal Gmail**.
2. Click **Blank form**.
3. Title: `Guest RSVP` (keep it short — the website shows **Kavya & Sanjay** in the wedding font above the form)
4. Add these questions (match your site):

   | Question type   | Title        | Required |
   |-----------------|--------------|----------|
   | Short answer    | Full Name    | Yes      |
   | Short answer    | Guest Count  | Yes      |

   Optional extras: Email, Phone, Which events attending, Dietary notes.

5. **Settings** (gear icon):
   - Turn on **Collect email addresses** if you want guest emails.
   - Limit to **1 response** per person (optional).

## 2. Link responses to a spreadsheet (your data dashboard)

1. Open the form → **Responses** tab.
2. Click the **Google Sheets** icon → **Create a new spreadsheet**.
3. Every RSVP appears as a new row. Open the sheet anytime from Gmail → Drive.

You can also enable **email notifications** for new responses:
- In the linked Sheet: **Tools → Notification rules → A user submits a form**.

### Email both Sanjay & Kavya on every RSVP

Google’s built-in “Get email notifications” only goes to one account. To **email both of you** with guest name and count, use the Apps Script in `scripts/rsvp-email-notifications.gs`:

1. Form → **Responses** → **Link to Sheets**
2. Sheet → **Extensions** → **Apps Script** → paste the script
3. Set both Gmail addresses in `NOTIFY_EMAILS`
4. **Triggers** → add **On form submit** → authorize → test RSVP


## 3. Embed the form on your wedding site

1. In the form, click **Send** (top right).
2. Choose the **`<>` Embed** tab.
3. Copy the `src="..."` URL from the iframe code.  
   It looks like:
   ```
   https://docs.google.com/forms/d/e/1FAIpQLS.../viewform?embedded=true
   ```
4. Open `data/config.js` in this project and paste:

   ```js
   googleFormEmbedUrl: "https://docs.google.com/forms/d/e/YOUR_ID/viewform?embedded=true",
   googleFormViewUrl: "https://docs.google.com/forms/d/e/YOUR_ID/viewform",
   ```

5. Save, commit, and push to GitHub Pages. Hard-refresh the site.

**Tip:** If you only have the normal link (without `embedded=true`), paste it in `googleFormViewUrl` — the site adds `embedded=true` automatically.

### Google Form title font (optional)

The embedded form cannot use the website's Cinzel font from code. To avoid duplicate names and a mismatched look:

1. In Google Forms, change the form **title** to `Guest RSVP` (not "Sanjay & Kavya").
2. Shorten the form **description** to one line, or leave it blank — venue and date already appear above the form on the site.
3. Optional: click the **palette** (Customize theme) → **Font style** → pick a serif option such as **Playfair Display** for when guests open the form in a new tab.

## 4. Manage RSVPs

| Task              | Where |
|-------------------|--------|
| View all guests   | Google Sheet (Responses tab → Open in Sheets) |
| Export CSV        | Sheet → **File → Download → CSV** |
| Edit form         | forms.google.com → your form |
| Share with Kavya  | Sheet → **Share** → add her Gmail |

## Privacy

- Do not commit private form URLs if the repo is public and you want to hide the form ID (optional). For a wedding site, a public RSVP form is normal.
- Guest data lives in **your** Google account only; the static website does not store RSVPs on a server.

## Troubleshooting

- **Form not showing:** Check `googleFormEmbedUrl` in `config.js` is not empty and includes `viewform`.
- **Iframe blank:** Form must be set to accept responses (not closed). Check form settings.
- **Wrong account:** Create the form while logged into the Gmail where you want responses stored.
