# NAMMAVARU event registration

## Google Sheets on Vercel

The `/api/registrations` Vercel function appends submissions to the `Registrations` tab. Row 1 must contain these headers, in order:

`Timestamp` | `Full name` | `Email` | `Phone number` | `City` | `Age`

To configure the integration:

1. Enable the Google Sheets API in a Google Cloud project and create a service account.
2. Share the spreadsheet with the service account's email as an **Editor**. Keep the sheet's general access set to **Restricted**.
3. In Vercel, open the project settings' **Environment Variables** and add:
   - `GOOGLE_SHEET_ID` — the spreadsheet ID.
   - `GOOGLE_SERVICE_ACCOUNT_JSON` — the complete contents of the service account JSON key file.
4. Apply the variables to the production environment and redeploy.

Never commit the service-account JSON or paste it into chat. The `.env` file is ignored by Git. Local `npm run dev` continues to use the Excel workbook configured by `REGISTRATION_WORKBOOK_PATH`; the Google Sheets function runs when deployed to Vercel.
