//This script is for the object selector to fill the two tables in the compare page simultaneously, and show the differences

import { populateObjectPermissionsTable, populateFieldPermissionsTable } from "./fillTables.js";
import { populateCompareObjectPermissionsTable, populateCompareFieldPermissionsTable } from "./fillCompareTables.js";

document.addEventListener("DOMContentLoaded", () => {
  const objectNamesDropdown = document.getElementById("objectNames");

  // Retrieve data from sessionStorage for both sets
  const permissionsData = JSON.parse(sessionStorage.getItem("permissionsData"));
  const permissionsDataCompare = JSON.parse(sessionStorage.getItem("permissionsDataCompare"));

  if (permissionsData && permissionsDataCompare) {
    const { objectNames, fieldMap, objectMap } = permissionsData;
    const { fieldMap: fieldMapCompare, objectMap: objectMapCompare } = permissionsDataCompare;

    if (Array.isArray(objectNames) && objectNames.length) {
      // Populate dropdown options
      objectNamesDropdown.innerHTML = "";

      objectNames.forEach((name, index) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        objectNamesDropdown.appendChild(option);

        if (index === 0) option.selected = true;
      });

      // Function to clear specific tables
      function clearTableData(tableId) {
        const tableBody = document.getElementById(tableId).getElementsByTagName("tbody")[0];
        tableBody.innerHTML = ''; // Clear all rows in specified table body
      }

      // Populate and compare the default selected object
      const defaultObject = objectNames[0];
      if (defaultObject) {
        clearTableData('objectTable'); // Clear main object table
        clearTableData('fieldsTable'); // Clear main field table
        clearTableData('objectCompareTable'); // Clear comparison object table
        clearTableData('fieldsCompareTable'); // Clear comparison field table

        populateObjectPermissionsTable(defaultObject, objectMap);
        populateFieldPermissionsTable(defaultObject, fieldMap);
        populateCompareObjectPermissionsTable(defaultObject, objectMapCompare);
        populateCompareFieldPermissionsTable(defaultObject, fieldMapCompare);

        // Apply comparison highlights for object permissions if data exists
        if (objectMap[defaultObject] && objectMap[defaultObject].length > 0) {
            highlightDifferences("objectCompareTable", objectMap[defaultObject], objectMapCompare[defaultObject], ["read", "create", "edit", "delete"], 1);
            }
            // Always apply comparison highlights for field permissions
            highlightDifferences("fieldsCompareTable", fieldMap[defaultObject], fieldMapCompare[defaultObject], ["read", "edit"], 1);
      }

      // Listen for dropdown changes to update both table sets and highlight differences
      objectNamesDropdown.addEventListener("change", () => {
        const selectedObject = objectNamesDropdown.value;
        if (selectedObject) {
          clearTableData('objectTable');
          clearTableData('fieldsTable');
          clearTableData('objectCompareTable');
          clearTableData('fieldsCompareTable');

          populateObjectPermissionsTable(selectedObject, objectMap);
          populateFieldPermissionsTable(selectedObject, fieldMap);
          populateCompareObjectPermissionsTable(selectedObject, objectMapCompare);
          populateCompareFieldPermissionsTable(selectedObject, fieldMapCompare);

            // Apply comparison highlights for object permissions if data exists
            if (objectMap[selectedObject] && objectMap[selectedObject].length > 0) {
            highlightDifferences("objectCompareTable", objectMap[selectedObject], objectMapCompare[selectedObject], ["read", "create", "edit", "delete"], 1);
            }

            // Always apply comparison highlights for field permissions
            highlightDifferences("fieldsCompareTable", fieldMap[selectedObject], fieldMapCompare[selectedObject], ["read", "edit"], 1);
        }
      });

      // Function to highlight differences
      function highlightDifferences(tableId, primaryData, compareData, permissions, startColumn = 1) {
        console.log('permissions:', permissions);
        console.log('startColumn:', startColumn);
        const table = document.getElementById(tableId);
        if (!table) {
          console.error(`Table with ID "${tableId}" not found.`);
          return;
        }

        const rows = table.getElementsByTagName("tr");

        primaryData.forEach((primaryRowData, index) => {
          const compareRowData = compareData[index];
          const row = rows[index + 1]; // skip header row

          if (!row || !compareRowData) {
            console.warn(`Skipping row ${index} due to missing row or comparison data.`);
            return;
          }

          permissions.forEach((perm, permIndex) => {
            const colIndex = startColumn + permIndex; // Skip first column
            const cell = row.cells[colIndex];

            if (!cell) {
              console.warn(`Missing cell for permission "${perm}" in row ${index}`);
              return;
            }

            // Highlight only
            const primaryValue = primaryRowData[perm];
            const compareValue = compareRowData[perm];

            if (primaryValue !== compareValue) {
              cell.style.backgroundColor = "#fadbd8";
            } else {
              cell.style.backgroundColor = ""; // Reset if identical
            }
          });
        });
      }

    }
  } else {
    console.error("Error: permissionsData or permissionsDataCompare is missing or malformed.");
  }
});
