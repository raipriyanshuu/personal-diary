// Handle form submission for both adding and editing diary entries
document.getElementById('diary-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const id = document.getElementById('diary-id').value;
    const title = document.getElementById('diary-title').value;
    const content = document.getElementById('diary-content').value;
    const category = document.getElementById('diary-category').value;  // Get the category
    const token = localStorage.getItem('token');

    const submitButton = document.getElementById('diary-submit');
    submitButton.disabled = true;

    let response;
    try {
        if (id) {
            response = await fetch(`http://localhost:5000/diary/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ title, content, category }),  // Send category
            });
        } else {
            response = await fetch('http://localhost:5000/diary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ title, content, category }),  // Send category
            });
        }

        if (response.ok) {
            showAlert(id ? 'Entry updated successfully!' : 'Entry added successfully!', 'success');
            loadDiaryEntries();
        } else {
            const data = await response.json();  // Parse the error message
    console.error('Error:', data);  // Log the error details in the console
    showAlert(data.msg || 'Failed to save entry.', 'danger');
        }
    } catch (error) {
        showAlert('Network error.', 'danger');
    }

    submitButton.disabled = false;
    document.getElementById('diary-form').reset();
    document.getElementById('diary-id').value = '';
    submitButton.textContent = 'Add Entry';
});


// This is your submitDiaryEntry function
async function submitDiaryEntry(e) {
    e.preventDefault();  // Prevent the default form submission behavior

    const id = document.getElementById('diary-id').value;
    const title = document.getElementById('diary-title').value;
    const content = document.getElementById('diary-content').value;
    const category = document.getElementById('diary-category').value;  // Get the category
    // const password = document.getElementById('diary-password').value;  // Get the password
    const token = localStorage.getItem('token');

    const submitButton = document.getElementById('diary-submit');
    submitButton.disabled = true;

    let response;
    try {
        // const requestBody = { title, content, category, password };
        if (id) {
            response = await fetch(`http://localhost:5000/diary/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ title, content, category }),  // Send category
            });
        } else {
            response = await fetch('http://localhost:5000/diary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ title, content, category }),  // Send category
            });
        }

        if (response.ok) {
            showAlert(id ? 'Entry updated successfully!' : 'Entry added successfully!', 'success');
            loadDiaryEntries();
        } else {
            const data = await response.json();  // Parse the error message
            console.error('Error:', data);  // Log the error details in the console
            showAlert(data.msg || 'Failed to save entry.', 'danger');
        }
    } catch (error) {
        showAlert('Network error.', 'danger');
    }

    submitButton.disabled = false;
    document.getElementById('diary-form').reset();
    document.getElementById('diary-id').value = '';
    submitButton.textContent = 'Add Entry';
}

// Handle protected entry access
// Function to retrieve a protected entry
// async function getProtectedEntry(entryId) {
//     const token = localStorage.getItem('token');  // Ensure the token is set after login
  
//     try {
//       const response = await fetch(`http://localhost:5000/diary/${entryId}/protected`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-auth-token': token
//         },
//         body: JSON.stringify({ password })  // Send the password to verify
//       });
  
//       const data = await response.json();
  
//       if (response.ok) {
//         console.log('Protected entry retrieved successfully:', data);
//         // You can now display the entry content in the UI
//       } else {
//         console.error('Failed to retrieve entry:', data.msg);
//         alert(data.msg || 'Failed to retrieve entry');
//       }
//     } catch (error) {
//       console.error('Network error:', error);
//     }
//   }

  // Triggered when the user submits a password for a protected entry
// function submitPasswordForEntry(entryId) {
//     const password = document.getElementById('entry-password').value;
//     if (password) {
//       getProtectedEntry(entryId, password);
//     } else {
//       alert('Please enter a password');
//     }
//   }
  
  



// Edit entry handler
function editEntry(id, title, content, category) {
    document.getElementById('diary-title').value = title;
    document.getElementById('diary-content').value = content;
    document.getElementById('diary-id').value = id;
    
    // Set the category in the dropdown
    document.getElementById('diary-category').value = category;
    
    document.getElementById('diary-submit').textContent = 'Update Entry';  // Change button text to "Update"
}


// Search and filter diary entries by text and category
function searchEntries() {
    const searchText = document.getElementById('search-box').value.toLowerCase();
    const searchCategory = document.getElementById('search-category').value;  // Get the selected category
    const entriesList = document.getElementById('diary-entries').children;

    Array.from(entriesList).forEach(entry => {
        const entryText = entry.textContent.toLowerCase();
        const entryCategory = entry.querySelector('.entry-category').textContent.split('Category: ')[1].split(' | ')[0];  // Get the entry category text

        // Filter by text and category (if a category is selected)
        const matchesText = entryText.includes(searchText);
        const matchesCategory = searchCategory === "" || entryCategory === searchCategory;

        if (matchesText && matchesCategory) {
            entry.style.display = 'block';
        } else {
            entry.style.display = 'none';
        }
    });
}


// Load diary entries and display them based on the selected category
// Load diary entries and display them based on the selected category
// Load diary entries and display them based on the selected category
async function loadDiaryEntries() {
    const token = localStorage.getItem('token');
    if (!token) return console.error('Please log in first.');

    const selectedCategory = document.getElementById('search-category').value;  // Get the selected category
    try {
        const response = await fetch('http://localhost:5000/diary', {
            method: 'GET',
            headers: {
                'x-auth-token': token,
            },
        });

        const entries = await response.json();
        console.log('Fetched Entries:', entries);
        if (response.ok) {
            const entriesList = document.getElementById('diary-entries');
            entriesList.innerHTML = '';

            // Sort entries by pinned status (pinned entries come first)
            entries
                .sort((a, b) => b.pinned - a.pinned)
                .filter(entry => !selectedCategory || entry.category === selectedCategory)  // Filter by selected category
                .forEach(entry => {
                    const formattedDate = dayjs(entry.date).format('MMMM D, YYYY h:mm A');
                    const listItem = document.createElement('li');
                    listItem.classList.add('list-group-item');
                    listItem.innerHTML = `
                        <strong>${entry.title}</strong>: ${entry.content}
                        <div class="text-muted entry-category">Category: ${entry.category} | ${formattedDate}</div>
                        <button class="btn btn-sm ${entry.pinned ? 'btn-secondary' : 'btn-outline-secondary'} float-end me-2" onclick="togglePin('${entry._id}', ${entry.pinned})">
                            ${entry.pinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button class="btn btn-sm btn-warning float-end me-2" onclick="editEntry('${entry._id}', '${entry.title}', '${entry.content}', '${entry.category}')">Edit</button>
                        <button class="btn btn-sm btn-danger float-end me-2" onclick="deleteEntry('${entry._id}')">Delete</button>
                    `;
                    entriesList.appendChild(listItem);
                });

            if (entriesList.innerHTML === '') {
                entriesList.innerHTML = '<li class="list-group-item text-center">No entries found in this category.</li>';
            }
        } else {
            console.error('Failed to load entries.');
        }
    } catch (error) {
        console.error('Network error.');
    }
}
// toggle pin..

async function togglePin(id, isPinned) {
    const token = localStorage.getItem('token');
    if (!token) return console.error('Please log in first.');

    try {
        const response = await fetch(`http://localhost:5000/diary/${id}/pin`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({ pinned: !isPinned })  // Toggle the pinned state
        });

        if (response.ok) {
            showAlert(isPinned ? 'Entry unpinned successfully!' : 'Entry pinned successfully!', 'success');
            loadDiaryEntries();  // Reload entries to update order
        } else {
            showAlert('Failed to pin/unpin entry.', 'danger');
        }
    } catch (error) {
        showAlert('Network error.', 'danger');
    }
}






// Delete entry handler
// Delete entry handler
async function deleteEntry(id) {
    const token = localStorage.getItem('token');
    showLoading();

    try {
        const response = await fetch(`http://localhost:5000/diary/${id}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': token,
            },
        });

        if (response.ok) {
            showAlert('Entry deleted successfully.', 'success');
            loadDiaryEntries();  // Reload the entries after deletion
        } else {
            showAlert('Failed to delete entry.', 'danger');
        }
    } catch (error) {
        showAlert('Network error. Please try again later.', 'danger');
    }

    hideLoading();
}

