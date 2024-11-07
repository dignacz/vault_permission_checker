const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());

// Proxy API endpoint
app.post('/api/proxy', async (req, res) => {
    const { sessionId, dns, apiVersion, userId } = req.body;

    // Construct the URL
    const url = `https://${dns}/api/${apiVersion}/objects/users/${userId}/permissions`;

    console.log(url);

    try {
        // Make the API request with axios
        const response = await axios.get(url, {
            headers: {
                'Authorization': sessionId,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // Send back the JSON response from the API
        res.json(response.data);
    } catch (error) {
        console.error('Error calling the API:', error.message);
        res.status(error.response ? error.response.status : 500).json({
            message: 'Error calling the API',
            error: error.message
        });
    }
});

// Proxy API endpoint
app.post('/api/getUserDetails', async (req, res) => {
    const { sessionId, dns, apiVersion, userId } = req.body;

    // Construct the URL
    const url = `https://${dns}/api/${apiVersion}/objects/users/${userId}`;

    console.log(url);

    try {
        // Make the API request with axios
        const response = await axios.get(url, {
            headers: {
                'Authorization': sessionId,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // Access the 'users' array from the response
        const users = response.data.users;

        // Check if users array exists and has at least one entry
        if (!users || users.length === 0) {
            console.error("No user data found in API response.");
            return res.status(500).send("No user data found in API response.");
        }

        // Assuming you want the first user in the array
        const user = users[0].user;

        const userDetails = {
            fullName: (user.user_first_name__v || 'N/A') + ' ' + (user.user_last_name__v || 'N/A'),
            username: user.user_name__v || 'N/A',
            email: user.user_email__v || 'N/A',
            securityProfile: user.security_profile__v || 'N/A',
        };

        res.json(userDetails);

    } catch (error) {
        console.error('Error calling the API:', error.message);
        res.status(error.response ? error.response.status : 500).json({
            message: 'Error calling the API',
            error: error.message
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
