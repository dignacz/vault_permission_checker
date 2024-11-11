document.getElementById('apiForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    //Submitter  to differentiate if it's the 'Get Permissions' button or the 'Compare Permissions'
    const submitter = event.submitter;
    const userIdInput = document.getElementById('userId').value;
    const userIdCompareInput = document.getElementById('userIdCompare').value;

    // Get the loading icon and submit button elements
    const loadingIcon = document.getElementById("loadingIcon");
    const submitButton = document.getElementById("submitButton");
    const submitButtonCompare = document.getElementById("submitButtonCompare");

    if (submitter.id === 'submitButtonCompare') {

        if (!userIdCompareInput) {
            return; // Stop form submission if userIdCompare is empty
        }

        // Check if userId and userIdCompare have the same value
        if (userIdInput === userIdCompareInput) {
            return; // Stop form submission if they are the same
        }
    }

    // Show the loading icon and disable the submit button
    loadingIcon.style.display = "inline";
    submitButton.disabled = true;
    submitButtonCompare.disabled = true;

    // Get values from the form
    const sessionId = document.getElementById('sessionId').value;
    const dns = document.getElementById('dns').value;
    const apiVersion = document.getElementById('apiVersion').value;
    const userId = document.getElementById('userId').value;

    try {
        // Send POST request to the API proxy endpoint
        const response = await fetch('/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId, dns, apiVersion, userId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Received Data:', responseData);

        // Process permission data
        const items = responseData.data || [];
        const objectNames = new Set();
        const fieldMap = {};
        const objectMap = {};

        items.forEach(item => {
            const nameParts = item.name__v.split('.');
            if (nameParts.length >= 2) {
                const objectName = nameParts[1];
                const fieldName = nameParts[2];
                const actionNames = nameParts[3];
                const permissions = item.permissions;

                objectNames.add(objectName);

                if (actionNames === 'field_actions') {
                    if (!fieldMap[objectName]) {
                        fieldMap[objectName] = [];
                    }
                    fieldMap[objectName].push({
                        fieldName: fieldName,
                        read: permissions.read,
                        edit: permissions.edit
                    });
                } else if (actionNames === 'object_actions') {
                    if (!objectMap[objectName]) {
                        objectMap[objectName] = [];
                    }
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

        
        // Send POST request to get user details
        const userResponse = await fetch('/api/getUserDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId, dns, apiVersion, userId })
        });

        if (!userResponse.ok) {
            throw new Error(`HTTP error! Status: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        console.log('Received User Data:', userData);

        // Store the data in sessionStorage for use on the next page
        sessionStorage.setItem('permissionsData', JSON.stringify({ objectNames: Array.from(objectNames), fieldMap, objectMap }));
        sessionStorage.setItem('userData', JSON.stringify(userData));

        //Check which button was clicked
        if (submitter.id === 'submitButton') {
            // Check if the data is stored before redirecting
        if (sessionStorage.getItem('permissionsData') && sessionStorage.getItem('userData')) {
            // Data is successfully stored, now redirect
            window.location.href = '/permission-check';
        } else {
            console.error('Error: Data not stored correctly.');
        }
        } 
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Hide the loading icon and re-enable the submit button
        loadingIcon.style.display = "none";
        submitButton.disabled = false;
        submitButtonCompare.disabled = false;
    }
});

