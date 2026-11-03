# NAMMAVARU event registration

## Google Sheets on Vercel

The Vercel `/api/registrations` function forwards submissions to a Google Apps Script web app. This avoids service-account keys, which may be blocked by a Google Workspace organization policy.

1. Open [script.google.com](https://script.google.com), create a standalone project, and replace its `Code.gs` with [`apps-script/Code.gs`](./apps-script/Code.gs).
2. In **Project Settings → Script properties**, add:
   - `GOOGLE_SHEET_ID` — the ID from the Google Sheet URL.
   - `GOOGLE_APPS_SCRIPT_SECRET` — a private random secret. Generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
3. In the Apps Script editor, select `authorizeSpreadsheetAccess` in the function list, click **Run**, and grant the requested spreadsheet access.
4. Choose **Deploy → New deployment → Web app**, set **Execute as** to **Me**, and select **Who has access → Anyone**. Deploy and copy the web-app URL ending in `/exec`. If your organization disallows public web apps, ask your admin to allow this deployment or use an organization-approved integration.
5. In Vercel **Settings → Environment Variables**, add `GOOGLE_APPS_SCRIPT_URL` with the `/exec` URL and `GOOGLE_APPS_SCRIPT_SECRET` with the same secret used in Script properties. Set both for **Production**, then redeploy.
6. Submit a test registration and confirm it appears in the `Registrations` tab. The script creates the tab and header row if they are missing.

Keep the shared secret out of source control and chat. The Sheet can remain Restricted; the Apps Script executes as its owner. Local `npm run dev` continues to use the Excel workbook configured by `REGISTRATION_WORKBOOK_PATH`.
