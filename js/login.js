
if (LMS.isLoggedIn()) {
    location.replace('dashboard.html');
}

document.getElementById('loginForm').addEventListener('submit', function (e) {

    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const err = document.getElementById('err');

    if (username === '' || password === '') {
        err.textContent = 'Please enter your username and password.';
        return;
    }

    if (LMS.login(username, password)) {
        location.replace('dashboard.html');
    } else {
        err.textContent = 'Incorrect username or password.';
    }
});
