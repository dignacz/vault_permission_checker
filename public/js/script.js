document.getElementById('apiForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get values from the form
    const sessionId = document.getElementById('sessionId').value;
    const dns = document.getElementById('dns').value;
    const apiVersion = document.getElementById('apiVersion').value;
    const userId = document.getElementById('userId').value;

    try {
        // Send POST request to Express server's proxy endpoint
        const response = await fetch('/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId, dns, apiVersion, userId })
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const responseData = await response.json();
        console.log('Received Data:', responseData);

        // Extract 'data' from the response
        const items = responseData.data || [];

        // Extract object names from "name__v" and populate dropdown
        const objectNames = new Set();  // Using a set to avoid duplicates
        const fieldMap = {};

        items.forEach(item => {
            const nameParts = item.name__v.split('.');  // Split by dots
            if (nameParts.length >= 2) {
                const objectName = nameParts[1]; // Add only the second part (e.g., account__v)
                const fieldName = nameParts[2]; // Object fields
                const actionNames = nameParts[3]; // Field / Object Actions
                const permissions = item.permissions;

                // Store unique object names
                objectNames.add(objectName);

                // Map fields to each object along with permissions
                if (!fieldMap[objectName]) {
                    fieldMap[objectName] = [];
                }
                fieldMap[objectName].push({
                    fieldName: fieldName,
                    read: permissions.read,
                    edit: permissions.edit
                });
            }
        });

        // Populate Object Names Dropdown
        const objectNamesDropdown = document.getElementById('objectNames');
        
        // Clear previous options
        objectNamesDropdown.innerHTML = '<option value="">-- Select an Object --</option>';

        objectNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            objectNamesDropdown.appendChild(option);
        });

        // Attach the event listener to the dropdown to trigger populateTable on change
        objectNamesDropdown.addEventListener('change', populateTable);

        // Define populateTable function here or move it outside the try-catch block
        function populateTable() {
            const selectedObject = objectNamesDropdown.value;
            const fieldsTableBody = document.getElementById('fieldsTable').getElementsByTagName('tbody')[0];

            // Clear existing table rows
            fieldsTableBody.innerHTML = '';

            // Populate table with field names and permissions for the selected object
            if (fieldMap[selectedObject]) {
                fieldMap[selectedObject].forEach(field => {
                    const row = document.createElement('tr');

                    // Field Name Cell
                    const fieldNameCell = document.createElement('td');
                    fieldNameCell.textContent = field.fieldName;
                    row.appendChild(fieldNameCell);

                    // Read Permission Cell
                    const readCell = document.createElement('td');
                    readCell.textContent = field.read ? 'True' : 'False';
                    row.appendChild(readCell);

                    // Edit Permission Cell
                    const editCell = document.createElement('td');
                    editCell.textContent = field.edit ? 'True' : 'False';
                    row.appendChild(editCell);

                    // Append row to table body
                    fieldsTableBody.appendChild(row);
                });
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
});
