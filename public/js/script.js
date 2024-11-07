document.getElementById('apiForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get the loading icon and submit button elements
    const loadingIcon = document.getElementById('loadingIcon');
    const submitButton = document.getElementById('submitButton');

    // Show the loading icon and disable the submit button
    loadingIcon.style.display = 'inline';
    submitButton.disabled = true;

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

        // Separate data for object and field permissions
        const objectNames = new Set(); // Unique object names
        const fieldMap = {};           // Field permissions for each object
        const objectMap = {};          // Object permissions for each object

        items.forEach(item => {
            const nameParts = item.name__v.split('.');  // Split by dots
            if (nameParts.length >= 2) {
                const objectName = nameParts[1];  // Object name (e.g., account__v)
                const fieldName = nameParts[2];   // Field name or object type
                const actionNames = nameParts[3]; // Action type (field_actions or object_actions)
                const permissions = item.permissions;

                // Store unique object names
                objectNames.add(objectName);

                // Separate field permissions and object permissions
                if (actionNames === 'field_actions') {
                    // Map field permissions to each object
                    if (!fieldMap[objectName]) {
                        fieldMap[objectName] = [];
                    }
                    fieldMap[objectName].push({
                        fieldName: fieldName,
                        read: permissions.read,
                        edit: permissions.edit
                    });
                } else if (actionNames === 'object_actions') {
                    // If the objectName does not exist in the objectMap, initialize an empty array
                    if (!objectMap[objectName]) {
                        objectMap[objectName] = [];
                    }
                
                    // Push a new object containing the fieldName (objectType) and CRUD permissions into the array
                    objectMap[objectName].push({
                        objectType: fieldName,  
                        create: permissions.create || false,
                        read: permissions.read || false,
                        edit: permissions.edit || false,
                        delete: permissions.delete || false
                    });
                }
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

        // Attach the event listener to the dropdown to trigger populateTables on change
        objectNamesDropdown.addEventListener('change', populateTables);

        // Function to populate both Object and Field Permissions tables based on the selected object
        function populateTables() {
            const selectedObject = objectNamesDropdown.value;

            // Populate Object Permissions Table
            const objectTableBody = document.getElementById('objectTable').getElementsByTagName('tbody')[0];
            objectTableBody.innerHTML = ''; // Clear previous rows

            if (objectMap[selectedObject]) {
                objectMap[selectedObject].forEach(objectTP => {
                const row = document.createElement('tr');

                // Add Object Type Cell (the fieldName when it's an object type)
                const objectTypeCell = document.createElement('td');
                objectTypeCell.textContent = objectTP.objectType || 'N/A';
                row.appendChild(objectTypeCell);

                // Read permissions cell
                const readCell = document.createElement('td');
                readCell.textContent = objectTP.read ? 'X' : '';
                row.appendChild(readCell);

                // Create permissions cell
                const createCell = document.createElement('td');
                createCell.textContent = objectTP.create ? 'X' : '';
                row.appendChild(createCell);

                // Update permissions cell
                const updateCell = document.createElement('td');
                updateCell.textContent = objectTP.edit ? 'X' : '';
                row.appendChild(updateCell);

                // Delete permissions cell
                const deleteCell = document.createElement('td');
                deleteCell.textContent = objectTP.delete ? 'X' : '';
                row.appendChild(deleteCell);

                // Append the row to the Object Permissions table
                objectTableBody.appendChild(row);
            });
        }

            // Populate Field Permissions Table
            const fieldsTableBody = document.getElementById('fieldsTable').getElementsByTagName('tbody')[0];
            fieldsTableBody.innerHTML = '';  // Clear previous rows

            if (fieldMap[selectedObject]) {
                fieldMap[selectedObject].forEach(field => {
                    const row = document.createElement('tr');

                    // Field Name Cell
                    const fieldNameCell = document.createElement('td');
                    fieldNameCell.textContent = field.fieldName;
                    row.appendChild(fieldNameCell);

                    // Read Permission Cell
                    const readCell = document.createElement('td');
                    readCell.textContent = field.read ? 'X' : '';
                    row.appendChild(readCell);

                    // Edit Permission Cell
                    const editCell = document.createElement('td');
                    editCell.textContent = field.edit ? 'X' : '';
                    row.appendChild(editCell);

                    // Append row to Field Permissions table
                    fieldsTableBody.appendChild(row);
                });
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }


    //USER DATA

    try {
        // Send a POST request to the server to get the user details
        const userResponse = await fetch('/api/getUserDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId, dns, apiVersion, userId })  // Send the userId in the request body
        });

        // Check if the response is successful
        if (!userResponse.ok) {
            throw new Error(`HTTP error! Status: ${userResponse.status}`);
        }

        // Parse the JSON response
        const userData = await userResponse.json();
        console.log('Received User Data:', userData);

        // Get the table body element
        const userTableBody = document.getElementById('userTable').getElementsByTagName('tbody')[0];

        // Clear any existing data in the table
        userTableBody.innerHTML = '';

        // Create a new row for the user data
        const row = document.createElement('tr');

        // Full Name Cell
        const fullNameCell = document.createElement('td');
        fullNameCell.textContent = userData.fullName || 'N/A';
        row.appendChild(fullNameCell);

        // Username Cell
        const usernameCell = document.createElement('td');
        usernameCell.textContent = userData.username || 'N/A';
        row.appendChild(usernameCell);

        // User Email Cell
        const emailCell = document.createElement('td');
        emailCell.textContent = userData.email || 'N/A';
        row.appendChild(emailCell);

        // Security Profile Cell
        const securityProfileCell = document.createElement('td');
        securityProfileCell.textContent = userData.securityProfile || 'N/A';
        row.appendChild(securityProfileCell);

        // Append the row to the table body
        userTableBody.appendChild(row);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Hide the loading icon and re-enable the submit button
        loadingIcon.style.display = 'none';
        submitButton.disabled = false;
    }
});
