document.addEventListener('DOMContentLoaded', () => {
    // Retrieve data from sessionStorage
    const permissionsData = JSON.parse(sessionStorage.getItem('permissionsData'));
    const userData = JSON.parse(sessionStorage.getItem('userData'));

    // Debugging: Log permissionsData to check its structure
    console.log('permissionsData:', permissionsData);

    if (permissionsData) {
        const { objectNames, fieldMap, objectMap } = permissionsData;

        // Check if objectNames is an array
        if (objectNames && Array.isArray(objectNames)) {
            // Populate Object Names Dropdown
            const objectNamesDropdown = document.getElementById("objectNames");

            // Clear previous options
            objectNamesDropdown.innerHTML = '';

            // Add an initial empty option to the dropdown
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Select an Object";
            objectNamesDropdown.appendChild(defaultOption);

            // Populate the dropdown with object names
            objectNames.forEach((name, index) => {
                const option = document.createElement("option");
                option.value = name;
                option.textContent = name;
                objectNamesDropdown.appendChild(option);

                // Set the first object as the default selected value
                if (index === 0) {
                    option.selected = true;
                    // Trigger change event to load the corresponding data
                    populateTablesForObject(name, objectMap, fieldMap);
                }
            });

            // Event listener for when a user selects an object name
            objectNamesDropdown.addEventListener('change', () => {
                const selectedObject = objectNamesDropdown.value;

                // Clear previous table data
                clearTableData();

                if (selectedObject) {
                    // Populate Object Permissions table for selected object
                    populateObjectPermissionsTable(selectedObject, objectMap);

                    // Populate Field Permissions table for selected object
                    populateFieldPermissionsTable(selectedObject, fieldMap);
                }
            });
        } else {
            console.error('Error: objectNames is not an array or is undefined.');
        }

        // Populate User Data table if userData exists
        if (userData) {
            const userTableBody = document.getElementById('userTable').getElementsByTagName('tbody')[0];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${userData.fullName || 'N/A'}</td>
                <td>${userData.username || 'N/A'}</td>
                <td>${userData.email || 'N/A'}</td>
                <td>${userData.securityProfile || 'N/A'}</td>
            `;
            userTableBody.appendChild(row);
        }
    } else {
        console.error('Error: permissionsData is missing or malformed.');
    }
});

// Function to clear table data
function clearTableData() {
    const objectTableBody = document.getElementById('objectTable').getElementsByTagName('tbody')[0];
    const fieldsTableBody = document.getElementById('fieldsTable').getElementsByTagName('tbody')[0];

    // Clear both tables
    objectTableBody.innerHTML = '';
    fieldsTableBody.innerHTML = '';
}

// Function to populate Object Permissions table
export function populateObjectPermissionsTable(objectName, objectMap) {
    const objectTableBody = document.getElementById('objectTable').getElementsByTagName('tbody')[0];

    if (objectMap[objectName]) {
        objectMap[objectName].forEach(permission => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${permission.objectType}</td>
                <td>${permission.read ? 'X' : ''}</td>
                <td>${permission.create ? 'X' : ''}</td>
                <td>${permission.edit ? 'X' : ''}</td>
                <td>${permission.delete ? 'X' : ''}</td>
            `;
            objectTableBody.appendChild(row);
        });
    } else {
        console.error(`Error: No object permissions found for ${objectName}`);
    }
}

// Function to populate Field Permissions table
export function populateFieldPermissionsTable(objectName, fieldMap) {
    const fieldsTableBody = document.getElementById('fieldsTable').getElementsByTagName('tbody')[0];

    if (fieldMap[objectName]) {
        fieldMap[objectName].forEach(field => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${field.fieldName}</td>
                <td>${field.read ? 'X' : ''}</td>
                <td>${field.edit ? 'X' : ''}</td>
            `;
            fieldsTableBody.appendChild(row);
        });
    } else {
        console.error(`Error: No field permissions found for ${objectName}`);
    }
}

// Function to populate tables for the default object
function populateTablesForObject(objectName, objectMap, fieldMap) {
    // Populate Object Permissions table for the first object
    populateObjectPermissionsTable(objectName, objectMap);

    // Populate Field Permissions table for the first object
    populateFieldPermissionsTable(objectName, fieldMap);
}