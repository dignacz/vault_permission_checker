//This script is for the object selector to fill the two tables in the compare page simultenaously

import { populateObjectPermissionsTable, populateFieldPermissionsTable } from './fillTables.js';
import { populateCompareObjectPermissionsTable, populateCompareFieldPermissionsTable } from './fillCompareTables.js';

document.addEventListener('DOMContentLoaded', () => {
    const objectNamesDropdown = document.getElementById("objectNames");

    // Retrieve data from sessionStorage for both sets
    const permissionsData = JSON.parse(sessionStorage.getItem('permissionsData'));
    const permissionsDataCompare = JSON.parse(sessionStorage.getItem('permissionsDataCompare'));

    if (permissionsData && permissionsDataCompare) {
        const { objectNames, fieldMap, objectMap } = permissionsData;
        const { fieldMap: fieldMapCompare, objectMap: objectMapCompare } = permissionsDataCompare;

        if (Array.isArray(objectNames) && objectNames.length) {
            // Populate dropdown options
            objectNamesDropdown.innerHTML = '';
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Select an Object";
            objectNamesDropdown.appendChild(defaultOption);

            objectNames.forEach((name, index) => {
                const option = document.createElement("option");
                option.value = name;
                option.textContent = name;
                objectNamesDropdown.appendChild(option);

                if (index === 0) option.selected = true;
            });

            // Set tables for the default selected object
            const defaultObject = objectNames[0];
            if (defaultObject) {
                populateObjectPermissionsTable(defaultObject, objectMap);
                populateFieldPermissionsTable(defaultObject, fieldMap);
                populateCompareObjectPermissionsTable(defaultObject, objectMapCompare);
                populateCompareFieldPermissionsTable(defaultObject, fieldMapCompare);
            }

            // Listen for changes to update both table sets simultaneously
            objectNamesDropdown.addEventListener('change', () => {
                const selectedObject = objectNamesDropdown.value;
                if (selectedObject) {
                    populateObjectPermissionsTable(selectedObject, objectMap);
                    populateFieldPermissionsTable(selectedObject, fieldMap);
                    populateCompareObjectPermissionsTable(selectedObject, objectMapCompare);
                    populateCompareFieldPermissionsTable(selectedObject, fieldMapCompare);
                }
            });
        }
    } else {
        console.error('Error: permissionsData or permissionsDataCompare is missing or malformed.');
    }
});
