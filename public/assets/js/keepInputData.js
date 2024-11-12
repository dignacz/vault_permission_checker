//This script is for keeping the form populated with our data if we navigate back to the index page.
//If we reload the page, it will clear out

document.addEventListener("DOMContentLoaded", function () {
    const fields = ["sessionId", "dns", "userId", "userIdCompare", "apiVersion"];
    
    // Check if this is a page reload using the Navigation API
    const navigationType = performance.getEntriesByType("navigation")[0]?.type;
    if (navigationType === "reload") {
        sessionStorage.clear();
    } else {
        // Retrieve data from sessionStorage and populate the form fields if not a reload
        fields.forEach(field => {
            const value = sessionStorage.getItem(field);
            if (value) document.getElementById(field).value = value;
        });
    }

    // Save data to sessionStorage on form submission
    document.getElementById("apiForm").addEventListener("submit", function (event) {
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) sessionStorage.setItem(field, element.value);
        });
    });
});
