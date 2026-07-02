<<<<<<< HEAD
# IT Asset Manager

A lightweight IT asset tracking web app built with **Google Apps Script** and **Google Sheets**. Track hardware inventory, update locations, register new assets, and view live analytics — all from a modern dashboard UI.

![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-V8-4285F4?logo=google&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-Backend-34A853?logo=googlesheets&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?logo=chartdotjs&logoColor=white)

## Features

### Dashboard & Analytics
- **Score cards** — total assets, room assignments, categories, departments, recent changes, and unassigned rooms
- **Trend view** — 30-day line chart of asset changes from the change log
- **Category & department charts** — bar and donut views for inventory breakdown

### Asset Operations
- **Add new assets** — register items with Asset ID, name, category, department, room, model, serial number, and remarks
- **Update / move assets** — change room/ward and remarks with automatic audit logging
- **Searchable directory** — filter the full asset table in real time
- **Smart suggestions** — category and department autocomplete from existing inventory data

### Audit Trail
Every update and new asset registration is written to a **Change Log** sheet with timestamp, user email, old/new values, and field changed.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Google Apps Script (V8 runtime) |
| Database | Google Sheets |
| Frontend | HTML, CSS, JavaScript |
| Charts | [Chart.js](https://www.chartjs.org/) (CDN) |
| CLI (optional) | [clasp](https://github.com/google/clasp) |

## Project Structure

```
it-asset-manager/
├── Code.js          # Apps Script backend (API + sheet operations)
├── Index.html       # Dashboard UI
├── appsscript.json  # Apps Script project manifest
├── .clasp.json      # clasp configuration (local)
└── README.md
```

## Spreadsheet Setup

Create a Google Spreadsheet with an **Inventory** sheet (or use `Sheet1`) containing these column headers in row 1:

| Column | Required | Description |
|--------|----------|-------------|
| Asset ID | Yes | Unique identifier for each asset |
| Name of the Asset | Yes | Display name |
| Asset Category | No | e.g. Desktop PC, Monitor, Printer |
| Room/Ward No. | No | Current physical location |
| Department | No | Owning department |
| Model No. | No | Manufacturer model |
| Serial No. | No | Device serial number |
| Remarks | No | Free-text notes |

The **Change Log** sheet is created automatically on first update if it does not exist.

## Getting Started

### Prerequisites

- A Google account
- [Node.js](https://nodejs.org/) (optional, for clasp)
- Access to [Google Apps Script](https://script.google.com/)

### Option A — Manual setup (Apps Script editor)

1. Create a new [Google Spreadsheet](https://sheets.google.com) and set up the Inventory columns above.
2. Copy the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit
   ```
3. Go to [script.google.com](https://script.google.com) → **New project**.
4. Copy the contents of `Code.js` and `Index.html` into the project.
5. In `Code.js`, set your spreadsheet ID:
   ```js
   const SPREADSHEET_ID = "your-spreadsheet-id-here";
   ```
6. Save all files.
7. Deploy as a web app:
   - **Deploy** → **New deployment** → type **Web app**
   - Execute as: **Me**
   - Who has access: choose your audience (e.g. **Anyone** or **Anyone within your org**)
   - Click **Deploy** and open the web app URL

### Option B — Setup with clasp (recommended for developers)

1. **Install clasp**
   ```bash
   npm install -g @google/clasp
   ```

2. **Log in to Google**
   ```bash
   clasp login
   ```

3. **Clone or link this project**
   ```bash
   git clone <your-repo-url>
   cd it-asset-manager
   clasp clone <SCRIPT_ID>   # or clasp create --type sheets
   ```

4. **Configure your spreadsheet ID** in `Code.js`:
   ```js
   const SPREADSHEET_ID = "your-spreadsheet-id-here";
   ```

5. **Push code to Apps Script**
   ```bash
   clasp push
   ```

6. **Deploy the web app**
   ```bash
   clasp deploy --description "Initial release"
   ```
   Or deploy via the Apps Script editor: **Deploy → Manage deployments → New deployment**.

## Usage

1. Open the deployed web app URL.
2. The dashboard loads inventory data, score cards, and charts automatically.
3. Use **Operations → Add New Asset** to register a new item (Asset ID and Name are required).
4. Use **Operations → Update / Move** to change room/ward or remarks for an existing asset.
5. Search the **Active Assets Directory** table to find records quickly.
6. Review the **Change Log** sheet in Google Sheets for a full audit history.

## API Functions (Apps Script)

| Function | Description |
|----------|-------------|
| `doGet()` | Serves the web app UI |
| `getInventoryData()` | Returns all inventory rows as JSON |
| `getDashboardStats()` | Returns KPI data for score cards |
| `getTrendData()` | Returns chart data (30-day trends, category/dept breakdown) |
| `getFormOptions()` | Returns category/department suggestions |
| `addNewAsset(assetData)` | Adds a new row to Inventory and logs the event |
| `updateAssetLocation(id, room, remarks)` | Updates location/remarks and logs changes |

## Configuration

### Time zone

Set in `appsscript.json` (default: `Asia/Kolkata`):

```json
{
  "timeZone": "Asia/Kolkata"
}
```

### Web app access

Adjust deployment settings in the Apps Script editor or update `appsscript.json`:

```json
"webapp": {
  "executeAs": "USER_DEPLOYING",
  "access": "MYSELF"
}
```

> **Note:** `"access": "MYSELF"` restricts the app to the deploying user. Change this when deploying for a team or organization.

## Security Notes

- Never commit real spreadsheet IDs or sensitive data to a public repository. Use environment-specific configuration or replace the ID before pushing.
- The web app runs with the permissions of the deploying Google account (`executeAs: USER_DEPLOYING`).
- Ensure spreadsheet sharing and web app access settings match your organization's security policy.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No asset records found" | Confirm the Inventory sheet has data below the header row and `SPREADSHEET_ID` is correct |
| "Missing required columns" | Verify column headers match exactly (case-sensitive) |
| "Asset ID already exists" | Use a unique Asset ID when adding new assets |
| Charts not loading | Ensure the deployment allows external scripts (Chart.js CDN) |
| Permission errors | Re-authorize the script and redeploy the web app |

## License

This project is open source. Add your preferred license file (e.g. MIT) if you plan to share it publicly.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

Built with Google Apps Script for teams that want simple, spreadsheet-backed IT asset management without a separate database.
=======
# IT-Inventory-Management
Basic IT Inventory tool management to add  new assets, update assets with UI
>>>>>>> 8bc1961930e6668397a7b22e83f51ef446c3c938
