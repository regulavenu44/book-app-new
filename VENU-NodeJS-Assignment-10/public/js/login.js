
document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('loginemail').value.trim();
    const password = document.getElementById('loginpassword').value.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email === "" || !emailRegex.test(email)) {
        return alert('Enter a valid email');
    }
    if (password === "") {
        return alert('Password cannot be empty');
    }
    fetch(`/users/${email}/${password}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === false) {
                throw new Error('User Not exists');
            } else if (data.status === true) {
                localStorage.setItem('token', data.value);
                if (data.user.role == "user") {
                        window.location.href = '/home';
                }
                if (data.user.role == "admin") {
                        window.location.href = '/admin/dashboard';
                }
            } else {
                throw new Error(data.status);
            }
        })
        .catch(error => {
            alert(error.message);
        });
});
