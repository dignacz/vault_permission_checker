document.getElementById('apiForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get values from the form
    const sessionId = document.getElementById('sessionId').value;
    const dns = document.getElementById('dns').value;
    const apiVersion = document.getElementById('apiVersion').value;
    const userIdCompare = document.getElementById('userIdCompare').value;

//COMPARE PERMISSIONS
//Submitter  to differentiate if it's the 'Get Permissions' button or the 'Compare Permissions'
    const submitter = event.submitter;
    const userIdInput = document.getElementById('userId').value;
    const userIdCompareInput = document.getElementById('userIdCompare').value;
    
    if (submitter.id === 'submitButtonCompare') {

        if (!userIdCompareInput || !userIdInput) {
            alert('Error: User IDs to compare are required for this action.');
            return; // Stop form submission if at least one of the user fields are empty
        }

        // Check if userId and userIdCompare have the same value
        if (userIdInput === userIdCompareInput) {
            alert('Error: User ID and User ID 2 cannot be the same.');
            return; // Stop form submission if they are the same
        }

        try {
            // Send POST request to Express server's proxy endpoint
const response = await fetch("/api/proxySecondUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId, dns, apiVersion, userIdCompare }),
  });

  // Parse the JSON response
  const responseData = await response.json();
  console.log("Received Data:", responseData);

  // Extract 'data' from the response
  const items = responseData.data || [];

  // Separate data for object and field permissions
  const objectNames = new Set(); // Unique object names
  const fieldMap = {}; // Field permissions for each object
  const objectMap = {}; // Object permissions for each object

  items.forEach((item) => {
    const nameParts = item.name__v.split("."); // Split by dots
    if (nameParts.length >= 2) {
      const objectName = nameParts[1]; // Object name (e.g., account__v)
      const fieldName = nameParts[2]; // Field name or object type
      const actionNames = nameParts[3]; // Action type (field_actions or object_actions)
      const permissions = item.permissions;

      // Store unique object names
      objectNames.add(objectName);

      // Separate field permissions and object permissions
      if (actionNames === "field_actions") {
        // Map field permissions to each object
        if (!fieldMap[objectName]) {
          fieldMap[objectName] = [];
        }
        fieldMap[objectName].push({
          fieldName: fieldName,
          read: permissions.read,
          edit: permissions.edit,
        });
      } else if (actionNames === "object_actions") {
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
          delete: permissions.delete || false,
        });
      }
    }
  });

  const userResponse = await fetch("/api/getSecondUserDetails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId, dns, apiVersion, userIdCompare }), // Send the userId in the request body
  });

  // Check if the response is successful
  if (!userResponse.ok) {
    throw new Error(`HTTP error! Status: ${userResponse.status}`);
  }

  // Parse the JSON response
  const userData = await userResponse.json();
  console.log("Received User Data:", userData);

  // Store the data in sessionStorage for use on the next page
  sessionStorage.setItem('permissionsDataCompare', JSON.stringify({ objectNames: Array.from(objectNames), fieldMap, objectMap }));
  sessionStorage.setItem('userDataCompare', JSON.stringify(userData));


    if (sessionStorage.getItem('permissionsDataCompare') && sessionStorage.getItem('userDataCompare')) {
        // Data is successfully stored, now redirect
        window.location.href = '/comparison-check';
    } else {
        console.error('Error: Data not stored correctly.');

    }
        } catch (error) {
            console.error('Error:', error);
        }
}
});

        