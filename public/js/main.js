// main.js

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  updateUIBasedOnAuth();  // Check authentication state

  // Signup and Login form event listeners
  document.getElementById('signup-form').addEventListener('submit', handleSignup);
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  // Diary entry form event listener
  document.getElementById('diary-form').addEventListener('submit', submitDiaryEntry);

  // Search box event listener
  document.getElementById('search-box').addEventListener('keyup', searchEntries);
});

// Show and hide sections based on login status
function updateUIBasedOnAuth() {
  const token = localStorage.getItem('token');
  const authSection = document.getElementById('auth-section');
  const diarySection = document.getElementById('diary-section');

  if (token) {
      authSection.classList.add('d-none');
      diarySection.classList.remove('d-none');
      loadDiaryEntries();  // Load the diary entries for the user
  } else {
      authSection.classList.remove('d-none');
      diarySection.classList.add('d-none');
  }
}

window.onload = function() {
  document.getElementById('login-form').reset();
  document.getElementById('signup-form').reset();
};

function logout() {
  // Assuming you're handling the server-side logout here too

  // Clear the login form fields
  document.getElementById('login-form').reset();

  // Clear the signup form fields
  document.getElementById('signup-form').reset();

  // Redirect to homepage or do some other action
  window.location.href = '/';
}
