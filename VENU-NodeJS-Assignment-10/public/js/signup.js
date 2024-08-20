
document.getElementById('myForm').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const repassword = document.getElementById('repassword').value.trim();
    
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (name === "" || !nameRegex.test(name)) {
        return alert('Enter a valid name');
    }
    if (email === "" || !emailRegex.test(email)) {
        return alert('Enter a valid email');
    }
    if (password === "") {
        return alert('Password cannot be empty');
    }
    if (repassword === "") {
        return alert('Confirm password cannot be empty');
    }
    if (password !== repassword) {
        return alert('Password and confirm password must be the same');
    }

    const userData = {
        "name": name,
        "email": email,
        "password": password
    };

    fetch(`/users/${email}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => {
        if (!response.ok) {
            alert('Network response was not ok');
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.status === false) {
            return fetch('/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
        } else if (data.status === true) {
            alert('User already exists');
            throw new Error('User already exists');
        } else {
            throw new Error(data.status);
        }
    })
    .then(response1 => {
        if (!response1.ok) {
            alert('Network response was not ok');
            throw new Error('Network response was not ok');
        }
        return response1.json();
    })
    .then(data1 => {
        if (data1.status === true) {
            window.location.href='/login';
        } else {
            throw new Error(data1.status);
        }
    })
    .catch(error => {
        alert(error.message);
    });
});
