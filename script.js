// A new, simplified script.js

// === 1. VIEW MANAGEMENT ===
// This single function will control all page navigation.
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    // Show the requested page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        // Use 'flex' for pages that need to be centered, 'block' for standard pages.
        // We'll default to 'flex' for the simple layout.
        targetPage.style.display = 'flex'; 
    }
}


// === 2. EVENT LISTENERS ===
// This runs once the HTML is loaded.
document.addEventListener('DOMContentLoaded', () => {

    // Start on the password lock screen
    showPage('passwordLockView');

    // --- Button to Unlock the App ---
    document.getElementById('unlockAppBtn').addEventListener('click', () => {
        const passwordInput = document.getElementById('mainPasswordInput');
        // For this test, we'll just check if the password is '1234'
        if (passwordInput.value === '1234') {
            // On success, go to the Data Centre
            showPage('dataCentreView');
        } else {
            alert('Incorrect Password');
        }
    });

    // --- Navigation Buttons ---
    document.getElementById('goToNewTransactionBtn').addEventListener('click', () => {
        showPage('newTransactionView');
    });

    document.getElementById('goToDataCentreBtn').addEventListener('click', () => {
        showPage('dataCentreView');
    });

});