// auth.js

// Handle the signup form
async function handleSignup(e) {
    e.preventDefault();  // Prevent default behavior

    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    showLoading();

    try {
        const response = await fetch('http://localhost:5000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            showAlert('Signup successful!', 'success');
            localStorage.setItem('token', data.token);  // Store token
            updateUIBasedOnAuth();  // Update UI
        } else {
            showAlert(data.msg || 'Signup failed.', 'danger');
        }
    } catch (error) {
        showAlert('Network error. Please try again later.', 'danger');
    }

    hideLoading();
}

// Handle the login form
async function handleLogin(e) {
    e.preventDefault();  // Prevent default behavior

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    showLoading();

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            showAlert('Login successful!', 'success');
            localStorage.setItem('token', data.token);  // Store token
            updateUIBasedOnAuth();  // Update UI
        } else {
            showAlert(data.msg || 'Login failed.', 'danger');
        }
    } catch (error) {
        showAlert('Network error. Please try again later.', 'danger');
    }

    hideLoading();
}

// Handle the logout functionality
function handleLogout() {
    localStorage.removeItem('token');
    showAlert('Logged out successfully!', 'success');

    // Clear the login form fields
  document.getElementById('login-form').reset();

  // Clear the signup form fields
  document.getElementById('signup-form').reset();

  // Redirect to homepage or do some other action
  window.location.href = '/';
  
    updateUIBasedOnAuth();
}
