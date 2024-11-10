document
  .getElementById("apiForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const sessionId = document.getElementById("sessionId").value;
    const dns = document.getElementById("dns").value;
    const apiVersion = document.getElementById("apiVersion").value;
    const userId = document.getElementById("userId").value;
    const userIdCompare = document.getElementById("userIdCompare").value;

    /// Get the button that triggered the submit event
    const submitter = event.submitter;
    const userIdInput = document.getElementById('userId').value;
    const userIdCompareInput = document.getElementById('userIdCompare').value;

    // If "Compare Permissions" button is clicked
    if (submitter.id === 'submitButtonCompare') {
        // Check if userIdCompare is filled
        if (!userIdCompareInput) {
            alert('Error: User ID 2 to compare is required for this action.');
            return; // Stop form submission if userIdCompare is empty
        }

        // Check if userId and userIdCompare have the same value
    if (userIdInput === userIdCompareInput) {
        alert('Error: User ID and User ID 2 cannot be the same.');
        return; // Stop form submission if they are the same
    }
    }

    //GET PERMISSIONS BUTTON
    if (submitter.id === "submitButton") {

//CLEAR THE COMPARE TABLE IF THERE ARE VALUES



function clearTables() {
    // Get the table elements by their IDs
    const userCompareTable = document.getElementById("userCompareTable");
    const objectCompareTable = document.getElementById("objectCompareTable");
    const fieldsCompareTable = document.getElementById("fieldsCompareTable");
  
    // Clear the content of each table (remove all rows except the header)
    if (userCompareTable) {
      const userRows = userCompareTable.getElementsByTagName("tr");
      // Loop through the rows in the table and remove them (except the header row)
      for (let i = userRows.length - 1; i >= 1; i--) {
        userCompareTable.deleteRow(i);
      }
    }
  
    if (objectCompareTable) {
      const objectRows = objectCompareTable.getElementsByTagName("tr");
      // Loop through the rows in the table and remove them (except the header row)
      for (let i = objectRows.length - 1; i >= 1; i--) {
        objectCompareTable.deleteRow(i);
      }
    }
  
    if (fieldsCompareTable) {
      const fieldsRows = fieldsCompareTable.getElementsByTagName("tr");
      // Loop through the rows in the table and remove them (except the header row)
      for (let i = fieldsRows.length - 1; i >= 1; i--) {
        fieldsCompareTable.deleteRow(i);
      }
    }
  }

  clearTables();  // Clear all 3 tables


      // Get the loading icon and submit button elements
      const loadingIcon = document.getElementById("loadingIcon");
      const submitButton = document.getElementById("submitButton");

      // Show the loading icon and disable the submit button
      loadingIcon.style.display = "inline";
      submitButton.disabled = true;

      try {
        await getPermissionData();

      } catch (error) {
        console.error("Error:", error);
      }

      //USER DATA

      try {
        await getUserData();
      } catch (error) {
        console.error("Error:", error);
      } finally {
        // Hide the loading icon and re-enable the submit button
        loadingIcon.style.display = "none";
        submitButton.disabled = false;
      }

//COMPARE PERMISSIONS BUTTON

    } else if (submitter.id === "submitButtonCompare") {
    

      // Get the loading icon and submit button elements
      const loadingIconCompare = document.getElementById("loadingIconCompare");
      const submitButtonCompare = document.getElementById(
        "submitButtonCompare"
      );

      // Show the loading icon and disable the submit button
      loadingIconCompare.style.display = "inline";
      submitButtonCompare.disabled = true;

    //COMPARED USER PERMISSIONS

      try {
        //First we call the first user
        getPermissionData();

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

      // Populate Object Names Dropdown
      const objectNamesDropdown = document.getElementById("objectNames");

      // Clear previous options
      objectNamesDropdown.innerHTML ='';

      objectNames.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        objectNamesDropdown.appendChild(option);
      });

          // Set the first item as the default selected option if objectNames is not empty
if (objectNames.length > 0) {
    objectNamesDropdown.value = objectNames[0];
  }

  populateTables(objectNames[0]);

      // Attach the event listener to the dropdown to trigger populateTables on change only if the user table is populated
      const userCompareTable = document.getElementById("userCompareTable");
if (userCompareTable) {
    objectNamesDropdown.addEventListener("change", populateTables);
}


      function populateTables() {
        const selectedObject = objectNamesDropdown.value;
    
        // Populate Object Permissions Table
        const objectTableBody = document
          .getElementById("objectCompareTable")
          .getElementsByTagName("tbody")[0];
        objectTableBody.innerHTML = ""; // Clear previous rows
    
        if (objectMap[selectedObject]) {
          objectMap[selectedObject].forEach((objectTP) => {
            const row = document.createElement("tr");
    
            // Add Object Type Cell (the fieldName when it's an object type)
            const objectTypeCell = document.createElement("td");
            objectTypeCell.textContent = objectTP.objectType || "N/A";
            row.appendChild(objectTypeCell);
    
            // Read permissions cell
            const readCell = document.createElement("td");
            readCell.textContent = objectTP.read ? "X" : "";
            row.appendChild(readCell);
    
            // Create permissions cell
            const createCell = document.createElement("td");
            createCell.textContent = objectTP.create ? "X" : "";
            row.appendChild(createCell);
    
            // Update permissions cell
            const updateCell = document.createElement("td");
            updateCell.textContent = objectTP.edit ? "X" : "";
            row.appendChild(updateCell);
    
            // Delete permissions cell
            const deleteCell = document.createElement("td");
            deleteCell.textContent = objectTP.delete ? "X" : "";
            row.appendChild(deleteCell);
    
            // Append the row to the Object Permissions table
            objectTableBody.appendChild(row);
          });
        }
    
        // Populate Field Permissions Table
        const fieldsTableBody = document
          .getElementById("fieldsCompareTable")
          .getElementsByTagName("tbody")[0];
        fieldsTableBody.innerHTML = ""; // Clear previous rows
    
        if (fieldMap[selectedObject]) {
          fieldMap[selectedObject].forEach((field) => {
            const row = document.createElement("tr");
    
            // Field Name Cell
            const fieldNameCell = document.createElement("td");
            fieldNameCell.textContent = field.fieldName;
            row.appendChild(fieldNameCell);
    
            // Read Permission Cell
            const readCell = document.createElement("td");
            readCell.textContent = field.read ? "X" : "";
            row.appendChild(readCell);
    
            // Edit Permission Cell
            const editCell = document.createElement("td");
            editCell.textContent = field.edit ? "X" : "";
            row.appendChild(editCell);
    
            // Append row to Field Permissions table
            fieldsTableBody.appendChild(row);
          });
        }
      }


      } catch (error) {
        console.error("Error:", error);
      }

      try {
        getUserData();

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
    
          // Get the table body element
          const userTableBody = document
            .getElementById("userCompareTable")
            .getElementsByTagName("tbody")[0];
    
          // Clear any existing data in the table
          userTableBody.innerHTML = "";
    
          // Create a new row for the user data
          const row = document.createElement("tr");
    
          // Full Name Cell
          const fullNameCell = document.createElement("td");
          fullNameCell.textContent = userData.fullName || "N/A";
          row.appendChild(fullNameCell);
    
          // Username Cell
          const usernameCell = document.createElement("td");
          usernameCell.textContent = userData.username || "N/A";
          row.appendChild(usernameCell);
    
          // User Email Cell
          const emailCell = document.createElement("td");
          emailCell.textContent = userData.email || "N/A";
          row.appendChild(emailCell);
    
          // Security Profile Cell
          const securityProfileCell = document.createElement("td");
          securityProfileCell.textContent = userData.securityProfile || "N/A";
          row.appendChild(securityProfileCell);
    
          // Append the row to the table body
          userTableBody.appendChild(row);
      } catch (error) {
        
      } finally {
        // Hide the loading icon and re-enable the submit button
        loadingIconCompare.style.display = "none";
        submitButtonCompare.disabled = false;
      }
    }
    });



//GET PERMISSIONS FOR FIRST USER FUNCTION

async function getPermissionData() {
    const sessionId = document.getElementById("sessionId").value;
    const dns = document.getElementById("dns").value;
    const apiVersion = document.getElementById("apiVersion").value;
    const userId = document.getElementById("userId").value;

    // Send POST request to Express server's proxy endpoint
    const response = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, dns, apiVersion, userId }),
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

      // Populate Object Names Dropdown
      const objectNamesDropdown = document.getElementById("objectNames");

      // Clear previous options
      objectNamesDropdown.innerHTML ='';

      objectNames.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        objectNamesDropdown.appendChild(option);
      });

      // Set the first item as the default selected option if objectNames is not empty
if (objectNames.length > 0) {
    objectNamesDropdown.value = objectNames[0];
    // Call populateTables
  }
populateTables(objectNames[0]);

      // Attach the event listener to the dropdown to trigger populateTables on change
      objectNamesDropdown.addEventListener("change", populateTables);

      function populateTables() {
        const selectedObject = objectNamesDropdown.value;
    
        // Populate Object Permissions Table
        const objectTableBody = document
          .getElementById("objectTable")
          .getElementsByTagName("tbody")[0];
        objectTableBody.innerHTML = ""; // Clear previous rows
    
        if (objectMap[selectedObject]) {
          objectMap[selectedObject].forEach((objectTP) => {
            const row = document.createElement("tr");
    
            // Add Object Type Cell (the fieldName when it's an object type)
            const objectTypeCell = document.createElement("td");
            objectTypeCell.textContent = objectTP.objectType || "N/A";
            row.appendChild(objectTypeCell);
    
            // Read permissions cell
            const readCell = document.createElement("td");
            readCell.textContent = objectTP.read ? "X" : "";
            row.appendChild(readCell);
    
            // Create permissions cell
            const createCell = document.createElement("td");
            createCell.textContent = objectTP.create ? "X" : "";
            row.appendChild(createCell);
    
            // Update permissions cell
            const updateCell = document.createElement("td");
            updateCell.textContent = objectTP.edit ? "X" : "";
            row.appendChild(updateCell);
    
            // Delete permissions cell
            const deleteCell = document.createElement("td");
            deleteCell.textContent = objectTP.delete ? "X" : "";
            row.appendChild(deleteCell);
    
            // Append the row to the Object Permissions table
            objectTableBody.appendChild(row);
          });
        }
    
        // Populate Field Permissions Table
        const fieldsTableBody = document
          .getElementById("fieldsTable")
          .getElementsByTagName("tbody")[0];
        fieldsTableBody.innerHTML = ""; // Clear previous rows
    
        if (fieldMap[selectedObject]) {
          fieldMap[selectedObject].forEach((field) => {
            const row = document.createElement("tr");
    
            // Field Name Cell
            const fieldNameCell = document.createElement("td");
            fieldNameCell.textContent = field.fieldName;
            row.appendChild(fieldNameCell);
    
            // Read Permission Cell
            const readCell = document.createElement("td");
            readCell.textContent = field.read ? "X" : "";
            row.appendChild(readCell);
    
            // Edit Permission Cell
            const editCell = document.createElement("td");
            editCell.textContent = field.edit ? "X" : "";
            row.appendChild(editCell);
    
            // Append row to Field Permissions table
            fieldsTableBody.appendChild(row);
          });
        }
      }
    
}

//GET FIRST USER DATA FUNCTION
async function getUserData() {
    // Get values from the form
    const sessionId = document.getElementById("sessionId").value;
    const dns = document.getElementById("dns").value;
    const apiVersion = document.getElementById("apiVersion").value;
    const userId = document.getElementById("userId").value;
    //const userIdCompare = document.getElementById("userIdCompare").value;
    // Send a POST request to the server to get the user details
    const userResponse = await fetch("/api/getUserDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, dns, apiVersion, userId }), // Send the userId in the request body
      });

      // Check if the response is successful
      if (!userResponse.ok) {
        throw new Error(`HTTP error! Status: ${userResponse.status}`);
      }

      // Parse the JSON response
      const userData = await userResponse.json();
      console.log("Received User Data:", userData);

      // Get the table body element
      const userTableBody = document
        .getElementById("userTable")
        .getElementsByTagName("tbody")[0];

      // Clear any existing data in the table
      userTableBody.innerHTML = "";

      // Create a new row for the user data
      const row = document.createElement("tr");

      // Full Name Cell
      const fullNameCell = document.createElement("td");
      fullNameCell.textContent = userData.fullName || "N/A";
      row.appendChild(fullNameCell);

      // Username Cell
      const usernameCell = document.createElement("td");
      usernameCell.textContent = userData.username || "N/A";
      row.appendChild(usernameCell);

      // User Email Cell
      const emailCell = document.createElement("td");
      emailCell.textContent = userData.email || "N/A";
      row.appendChild(emailCell);

      // Security Profile Cell
      const securityProfileCell = document.createElement("td");
      securityProfileCell.textContent = userData.securityProfile || "N/A";
      row.appendChild(securityProfileCell);

      // Append the row to the table body
      userTableBody.appendChild(row);
}
