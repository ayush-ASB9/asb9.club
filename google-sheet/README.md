# Cohort 01 applications → Google Sheet

Every application submitted at asb9.club/apply becomes one row in a Google Sheet you own.
`Code.gs` is the script that receives the application and writes the row.

## One-time setup (about 5 minutes)

1. Create a new Google Sheet at https://sheets.new and name it, for example, "ASB9 Cohort 01 Applications".
2. In the Sheet, open **Extensions → Apps Script**.
3. Delete the code in the editor, paste in the whole of `Code.gs` from this folder, and press **Save**.
4. Click **Deploy → New deployment**. Click the gear next to "Select type" and choose **Web app**. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Click **Deploy**, then **Authorize access**. Google warns that the app isn't verified; click **Advanced → Go to (project name) (unsafe)**, then **Allow**. This is your own script, and it only touches this one Sheet.
6. Copy the **Web app URL**. It ends in `/exec`.
7. In Vercel, open the `asb9club` project → **Settings → Environment Variables**, add `VITE_COHORT_APPLICATION_URL` with that URL for **Production** (and Preview if you want), and save.
8. Redeploy: **Deployments → … on the latest → Redeploy**. The URL is built into the site, so it takes effect only after a redeploy.

To check step 6, open the Web app URL in your browser: it should show `{"ok":true,...}`.

The `Applications` tab and its header row are created on the first submission.

## Changing the script later

Edit the code in Apps Script, then **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**.
Editing the existing deployment keeps the same URL, so Vercel needs no change. Creating a *new* deployment gives a new URL.

## Notes

- Anyone with the Web app URL can add rows; it is visible in the site's code. The Sheet itself stays private to you.
- A retried submission (for example after a dropped connection) carries the same Submission ID and is not stored twice.
- Answers that start with `=`, `+`, `-` or `@` are stored as plain text, so they can't run as formulas.
- Video answers are links (YouTube, Drive, Loom), so nothing is uploaded to your Drive.
