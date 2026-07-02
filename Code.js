const SPREADSHEET_ID = "1AgeM21XyZZXuwS8j90WkebtlrTVtYfDY5nzzg9rtig4";

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('IT Asset Manager')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getInventorySheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName("Inventory") || ss.getSheetByName("Sheet1") || ss.getSheets()[0];
}

function getChangeLogSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let logSheet = ss.getSheetByName("Change Log");
  if (!logSheet) {
    logSheet = ss.insertSheet("Change Log");
    logSheet.appendRow(["Timestamp", "Asset ID", "Asset Name", "Field Changed", "Old Value", "New Value", "Changed By"]);
  }
  return logSheet;
}

function getInventoryHeaders_() {
  const sheet = getInventorySheet_();
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(h => h ? h.toString().trim() : "")
    .filter(Boolean);
}

function getFormOptions() {
  const inventory = getInventoryData();
  const categories = {};
  const departments = {};

  inventory.forEach(asset => {
    const category = (asset["Asset Category"] || "").toString().trim();
    const department = (asset["Department"] || "").toString().trim();
    if (category) categories[category] = true;
    if (department) departments[department] = true;
  });

  return {
    categories: Object.keys(categories).sort(),
    departments: Object.keys(departments).sort()
  };
}

function addNewAsset(assetData) {
  try {
    const sheet = getInventorySheet_();
    const headers = getInventoryHeaders_();
    const logSheet = getChangeLogSheet_();

    const required = ["Asset ID", "Name of the Asset"];
    required.forEach(col => {
      if (headers.indexOf(col) === -1) {
        throw new Error("Missing required column: " + col);
      }
    });

    const assetId = (assetData.assetId || "").toString().trim();
    const assetName = (assetData.assetName || "").toString().trim();

    if (!assetId) throw new Error("Asset ID is required.");
    if (!assetName) throw new Error("Asset name is required.");

    const data = sheet.getDataRange().getValues();
    const idCol = headers.indexOf("Asset ID");

    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol].toString().trim() === assetId) {
        throw new Error("Asset ID already exists: " + assetId);
      }
    }

    const fieldMap = {
      "Asset ID": assetId,
      "Name of the Asset": assetName,
      "Asset Category": (assetData.category || "").toString().trim(),
      "Room/Ward No.": (assetData.room || "").toString().trim(),
      "Department": (assetData.department || "").toString().trim(),
      "Model No.": (assetData.modelNo || "").toString().trim(),
      "Serial No.": (assetData.serialNo || "").toString().trim(),
      "Remarks": (assetData.remarks || "").toString().trim()
    };

    const row = headers.map(header => fieldMap[header] || "");
    sheet.appendRow(row);

    const timestamp = new Date();
    const user = Session.getActiveUser().getEmail() || "Authorized Operator";
    logSheet.appendRow([timestamp, assetId, assetName, "New Asset", "", "Added to inventory", user]);

    return { success: true, assetId: assetId };
  } catch (err) {
    throw new Error("Add Asset Failed: " + err.message);
  }
}

function getInventoryData() {
  try {
    const sheet = getInventorySheet_();
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    const headers = data.shift().map(h => h ? h.toString().trim() : "");

    return data.map(row => {
      let obj = {};
      headers.forEach((header, i) => {
        if (header) {
          let val = row[i];
          
          // CRITICAL FIX: Convert Date objects to readable strings so they don't break serialization
          if (val instanceof Date) {
            val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
          } else if (val !== null && val !== undefined) {
            val = val.toString().trim();
          } else {
            val = "";
          }
          
          obj[header] = val;
        }
      });
      return obj;
    });

  } catch (err) {
    throw new Error("Backend Error: " + err.message);
  }
}

function getChangeLogData() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const logSheet = ss.getSheetByName("Change Log");
    if (!logSheet || logSheet.getLastRow() <= 1) return [];

    const data = logSheet.getDataRange().getValues();
    const headers = data.shift().map(h => h ? h.toString().trim() : "");

    return data.map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        if (!header) return;
        let val = row[i];
        if (header === "Timestamp" && val instanceof Date) {
          obj[header] = val;
        } else if (val instanceof Date) {
          obj[header] = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
        } else if (val !== null && val !== undefined) {
          obj[header] = val.toString().trim();
        } else {
          obj[header] = "";
        }
      });
      return obj;
    });
  } catch (err) {
    throw new Error("Change Log Error: " + err.message);
  }
}

function getDashboardStats() {
  const inventory = getInventoryData();
  const changeLog = getChangeLogData();
  const tz = Session.getScriptTimeZone();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const stats = {
    totalAssets: 0,
    categoryCount: 0,
    departmentCount: 0,
    recentChanges: 0,
    assignedRooms: 0,
    unassignedRooms: 0,
    categories: {},
    departments: {}
  };

  inventory.forEach(asset => {
    const id = (asset["Asset ID"] || "").toString().trim();
    if (!id) return;

    stats.totalAssets++;

    const category = (asset["Asset Category"] || "Uncategorized").toString().trim() || "Uncategorized";
    const department = (asset["Department"] || "Unassigned").toString().trim() || "Unassigned";
    const room = (asset["Room/Ward No."] || "").toString().trim();

    stats.categories[category] = (stats.categories[category] || 0) + 1;
    stats.departments[department] = (stats.departments[department] || 0) + 1;

    if (room) stats.assignedRooms++;
    else stats.unassignedRooms++;
  });

  stats.categoryCount = Object.keys(stats.categories).length;
  stats.departmentCount = Object.keys(stats.departments).length;

  changeLog.forEach(entry => {
    const ts = entry["Timestamp"];
    if (!ts) return;
    const changeDate = ts instanceof Date ? ts : new Date(ts);
    if (isNaN(changeDate.getTime())) return;
    changeDate.setHours(0, 0, 0, 0);
    if (changeDate >= weekAgo) stats.recentChanges++;
  });

  return stats;
}

function getTrendData() {
  const changeLog = getChangeLogData();
  const inventory = getInventoryData();
  const tz = Session.getScriptTimeZone();
  const days = 30;
  const labels = [];
  const dayKeys = [];
  const changesByDay = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = Utilities.formatDate(d, tz, "yyyy-MM-dd");
    dayKeys.push(key);
    labels.push(Utilities.formatDate(d, tz, "MMM dd"));
    changesByDay[key] = 0;
  }

  changeLog.forEach(entry => {
    const ts = entry["Timestamp"];
    if (!ts) return;
    const changeDate = ts instanceof Date ? new Date(ts) : new Date(ts);
    if (isNaN(changeDate.getTime())) return;
    const key = Utilities.formatDate(changeDate, tz, "yyyy-MM-dd");
    if (Object.prototype.hasOwnProperty.call(changesByDay, key)) {
      changesByDay[key]++;
    }
  });

  const categoryBreakdown = {};
  inventory.forEach(asset => {
    const id = (asset["Asset ID"] || "").toString().trim();
    if (!id) return;
    const category = (asset["Asset Category"] || "Uncategorized").toString().trim() || "Uncategorized";
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
  });

  const deptBreakdown = {};
  inventory.forEach(asset => {
    const id = (asset["Asset ID"] || "").toString().trim();
    if (!id) return;
    const dept = (asset["Department"] || "Unassigned").toString().trim() || "Unassigned";
    deptBreakdown[dept] = (deptBreakdown[dept] || 0) + 1;
  });

  return {
    labels: labels,
    changes: dayKeys.map(key => changesByDay[key] || 0),
    categoryLabels: Object.keys(categoryBreakdown),
    categoryValues: Object.values(categoryBreakdown),
    departmentLabels: Object.keys(deptBreakdown),
    departmentValues: Object.values(deptBreakdown)
  };
}

function updateAssetLocation(assetId, newRoom, newRemarks) {
  try {
    const invSheet = getInventorySheet_();
    const logSheet = getChangeLogSheet_();

    const data = invSheet.getDataRange().getValues();
    const headers = data[0].map(h => h ? h.toString().trim() : "");
    
    const idCol = headers.indexOf("Asset ID");
    const nameCol = headers.indexOf("Name of the Asset");
    const roomCol = headers.indexOf("Room/Ward No.");
    const remarksCol = headers.indexOf("Remarks");

    if (idCol === -1 || roomCol === -1 || remarksCol === -1) {
      throw new Error("Missing required columns in your spreadsheet.");
    }

    let targetRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol].toString().trim() === assetId.toString().trim()) {
        targetRow = i + 1;
        break;
      }
    }

    if (targetRow === -1) throw new Error("Asset ID not found.");

    const assetName = invSheet.getRange(targetRow, nameCol + 1).getValue().toString();
    const oldRoom = invSheet.getRange(targetRow, roomCol + 1).getValue().toString();
    const oldRemarks = invSheet.getRange(targetRow, remarksCol + 1).getValue().toString();
    const timestamp = new Date();
    const user = Session.getActiveUser().getEmail() || "Authorized Operator";

    if (oldRoom.trim() !== newRoom.trim()) {
      logSheet.appendRow([timestamp, assetId, assetName, "Room/Ward No.", oldRoom, newRoom, user]);
      invSheet.getRange(targetRow, roomCol + 1).setValue(newRoom);
    }

    if (oldRemarks.trim() !== newRemarks.trim()) {
      logSheet.appendRow([timestamp, assetId, assetName, "Remarks", oldRemarks, newRemarks, user]);
      invSheet.getRange(targetRow, remarksCol + 1).setValue(newRemarks);
    }

    return "Success";
  } catch (err) {
    throw new Error("Update Failed: " + err.message);
  }
}