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

        items.forEach(item => {
            const nameParts = item.name__v.split('.');  // Split by dots
            if (nameParts.length >= 2) {
                objectNames.add(nameParts[1]); // Add only the second part (e.g., account__v)
            }
        });

        // Get the dropdown element
        const objectNamesDropdown = document.getElementById('objectNames');
        
        // Clear existing options
        objectNamesDropdown.innerHTML = '<option value="">-- Select an Object --</option>';

        // Add each unique object name to the dropdown
        objectNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            objectNamesDropdown.appendChild(option);
        });


    } catch (error) {
        console.error('Error:', error);
    }
});