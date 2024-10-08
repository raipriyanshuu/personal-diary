// Handle profile update form submission
document.getElementById('profile-form').addEventListener('submit', async function (e) {
    e.preventDefault();  // Prevent the form's default submission behavior

    const newUsername = document.getElementById('settings-username').value;
    const newEmail = document.getElementById('settings-email').value;
    const token = localStorage.getItem('token');  // Retrieve the stored token for authentication

    if (!token) {
        alert('You need to be logged in to update your profile.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/update-profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,  // Pass the token for authentication
            },
            body: JSON.stringify({ username: newUsername, email: newEmail })
        });

        if (response.ok) {
            const data = await response.json();
            alert('Profile updated successfully!');
            // Redirect the user to the main page with diary entries
            window.location.href = '/';
        } else {
            const errorData = await response.json();
            alert(errorData.msg || 'Failed to update profile.');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred while updating your profile.');
    }
});


// Handle password change form submission
document.getElementById('password-form').addEventListener('submit', async function (e) {
    e.preventDefault();  // Prevent default form submission behavior

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const token = localStorage.getItem('token');  // Retrieve the stored token for authentication

    if (!token) {
        alert('You need to be logged in to change your password.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,  // Pass the token for authentication
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        if (response.ok) {
            alert('Password changed successfully!');
            // Redirect the user to the main page
            window.location.href = '/';
        } else {
            const errorData = await response.json();
            alert(errorData.msg || 'Failed to change password.');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        alert('An error occurred while changing your password.');
    }
});

// Handle account deletion
document.getElementById('delete-account-btn').addEventListener('click', async function () {
    const confirmDeletion = confirm('Are you sure you want to delete your account? This action cannot be undone.');

    if (!confirmDeletion) return;

    const token = localStorage.getItem('token');  // Retrieve the stored token for authentication

    if (!token) {
        alert('You need to be logged in to delete your account.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/delete-account', {
            method: 'DELETE',
            headers: {
                'x-auth-token': token,  // Pass the token for authentication
            }
        });

        if (response.ok) {
            alert('Account deleted successfully!');
            // Log out the user
            localStorage.removeItem('token');
            // Redirect to login page
            window.location.href = '/';
        } else {
            const errorData = await response.json();
            alert(errorData.msg || 'Failed to delete account.');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('An error occurred while deleting your account.');
    }
});

