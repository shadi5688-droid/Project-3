// ==========================================
// 1. Check Login Status
// ==========================================

// If the user is already logged in, open Dashboard
if (LMS.isLoggedIn()) {
    location.replace('dashboard.html');
}


// ==========================================
// 2. Handle Login Form
// ==========================================

document.getElementById('loginForm').addEventListener('submit', async e => {

    // Prevent the page from refreshing
    e.preventDefault();


    // ======================================
    // 3. Get Username and Password
    // ======================================

    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;

    const err = document.getElementById('err');


    // ======================================
    // 4. Validate Input Fields
    // ======================================

    if (!u || !p) {
        err.textContent = 'Please enter your username and password.';
        return;
    }


    // ======================================
    // 5. Check Login Credentials
    // ======================================

    if (await LMS.login(u, p)) {

        // Login successful: open Dashboard
        location.replace('dashboard.html');

    } else {

        // Login failed: display error message
        err.textContent = 'Incorrect username or password.';

    }

});
