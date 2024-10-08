// helpers.js

// Function to show Bootstrap alerts
function showAlert(message, type) {
    const alertBox = document.getElementById('alert-box');
    alertBox.className = `alert alert-${type}`;  // Use Bootstrap alert classes like alert-success, alert-danger, etc.
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
    setTimeout(() => {
        alertBox.classList.add('d-none');  // Hide the alert after 3 seconds
    }, 3000);
}

// Function to show loading spinner
function showLoading() {
    document.getElementById('loading').classList.remove('d-none');
}

// Function to hide loading spinner
function hideLoading() {
    document.getElementById('loading').classList.add('d-none');
}
