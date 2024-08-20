window.onload = (event) => {
    verifyuser();
    reloadPage();
    getUsers();
    getRequests();
}
function reloadPage() {
    fetch('/books', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(resp => {
        if (!resp.ok) {
            return console.log('Network response in not ok');
        }
        return resp.json();
    }).then(data => {
        createCards(data);
        setOverview(data);
    });
}
function createCards(cardsData) {
    cardsData.forEach(cardInfo => {
        let cardContainer = document.getElementById('cardContainer');
        let card = document.createElement('div');
        card.classList.add('card');
        let image = document.createElement('img');
        image.classList.add('cardImage');
        image.src = cardInfo.url;
        image.onerror = function () {
            image.src = "/image/sample.jpg";
        }
        let name = document.createElement('p');
        name.classList.add('cardName');
        name.textContent = cardInfo.title;
        let price = document.createElement('p');
        price.classList.add('classPrice');
        price.textContent = '$ ' + cardInfo.price.$numberDecimal;
        price.style.color = 'blue';
        let starContainer = addStars(cardInfo.rating.$numberDecimal);
        card.appendChild(image);
        card.appendChild(name);
        card.appendChild(starContainer);
        card.appendChild(price);
        cardContainer.appendChild(card);
        card.addEventListener('mouseover', () => {
            let addButton = card.querySelector('.addButton');
            if (addButton) {
                addButton.style.display = 'block';
            }
        });

        card.addEventListener('mouseout', () => {
            let addButton = card.querySelector('.addButton');
            if (addButton) {
                addButton.style.display = 'none';
            }
        });
        image.addEventListener('dblclick', () => {
            window.location.href = `/admin/dashboard/book-${cardInfo._id}`;
        });
    });
}
function addStars(rating) {
    let container = document.createElement('div');
    container.classList.add('starContainer');
    while (rating >= 0.5) {
        if (rating >= 1) {
            let star = document.createElement('div');
            star.classList.add('star');
            star.innerHTML = `<img src="/image/star.png" class="starImage">`;
            container.appendChild(star);
            rating = rating - 1;
        }
        else {
            let star = document.createElement('div');
            star.classList.add('halfStar');
            star.innerHTML = `<img src="/image/starhalf.png" class="starImage">`;
            container.appendChild(star);
            rating = rating - 0.5;
        }
    }
    return container;
}
function verifyuser() {
    const token = localStorage.getItem('token');
    if (!token) {
        showInvalidSession('Your are not authorized');
    }
    else {
        fetch('/verify-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        }).then(resp => {
            if (!resp.ok) {
                showInvalidSession('Your Session is invalid');
            }
            return resp.json();
        }).then(data => {
            if (data.valid) {
                document.getElementById('userName').textContent = data.user;
            }
            else {
                localStorage.removeItem('token');
                showInvalidSession('Your Session is invalid');
            }
        }).catch(error => {
            showInvalidSession(error);
        });
    }
}
function showInvalidSession(message) {
    let container2 = document.getElementById('home');
    container2.style.display = 'none';
    let myModal = document.getElementById('sessionModal');
    myModal.style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}
document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('sessionModal').style.display = 'none';
});
document.getElementById('gotoLogin').addEventListener('click', () => {
    window.location.href = '/login';
});
document.getElementById('titleContainer').addEventListener('click', () => {
    window.location.href = '/home';
});
document.getElementById('actionContainer').addEventListener('click', () => {
    window.location.href = '/profile';
});
function setOverview(books) {
    let total = books.length;
    let copies = total * 50;
    let value = 0;
    for (let i = 0; i < books.length; i++) {
        value = value + parseFloat(books[i].price.$numberDecimal);
    }
    document.getElementById('availableCount').textContent = total;
    document.getElementById('copiesCount').textContent = copies;
    document.getElementById('valueCount').textContent = "$ " + value;
}
const menus = document.querySelectorAll('.links');
menus.forEach(link => {
    link.addEventListener('click', () => {
        menus.forEach(mylink => {
            mylink.classList.remove("active");
        });
        link.classList.add('active');
    });
});
document.getElementById('homeLink').addEventListener('click', () => {
    document.getElementById('home').style.display = 'block';
    const users = document.getElementById('users');
    if (users) {
        users.style.display = 'none';
    }
    const requests = document.getElementById('requests');
    if (requests) {
        requests.style.display = 'none';
    }
});
document.getElementById('usersLink').addEventListener('click', () => {
    document.getElementById('users').style.display = 'block';

    const home = document.getElementById('home');
    if (home) {
        home.style.display = 'none';
    }
    const requests = document.getElementById('requests');
    if (requests) {
        requests.style.display = 'none';
    }
});
document.getElementById('requestsLink').addEventListener('click', () => {
    document.getElementById('requests').style.display = 'block';
    const users = document.getElementById('users');
    if (users) {
        users.style.display = 'none';
    }
    const home = document.getElementById('home');
    if (home) {
        home.style.display = 'none';
    }
});
function getUsers() {
    fetch('/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        }
    }).then(resp => {
        if (!resp.ok) {
            throw new Error('Network response is not ok');
        }
        return resp.json();
    }).then(dataValues => {
        if (dataValues.status == true) {
            createTable(dataValues.data);
        }
    }).catch(err => {
        throw new Error(err);
    });
}
function getRequests(){
    fetch('/bookshelfall', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        }
    }).then(resp => {
        if (!resp.ok) {
            throw new Error('Network response is not ok');
        }
        return resp.json();
    }).then(dataValues => {
        if (dataValues.status == true) {
            console.log(dataValues.data);
            createRequestTable(dataValues.data);
        }
    }).catch(err => {
        throw new Error(err);
    });
}
function createTable(values) {
    const tableContainer = document.getElementById('userTable');
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headers = ['S.No', 'Name', 'Email', 'Role', 'Actions'];
    const trHead = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    values.forEach((item, index) => {
        const tr = document.createElement('tr');
        const tdSno = document.createElement('td');
        tdSno.textContent = index + 1;
        tr.appendChild(tdSno);
        const tdName = document.createElement('td');
        tdName.textContent = item.name;
        tr.appendChild(tdName);
        const tdEmail = document.createElement('td');
        tdEmail.textContent = item.email;
        tr.appendChild(tdEmail);
        const tdRole = document.createElement('td');
        tdRole.textContent = item.role;
        tr.appendChild(tdRole);
        const tdActions = document.createElement('td');
        tdActions.classList.add('actions');
        const btnUpdate = document.createElement('button');
        btnUpdate.id = 'updateButton';
        btnUpdate.textContent = 'Update';
        btnUpdate.onclick = () => updateUser(item.email);
        const btnDelete = document.createElement('button');
        btnDelete.id = 'deleteButton';
        btnDelete.textContent = 'Delete';
        btnDelete.onclick = () => deleteUser(item._id);
        tdActions.appendChild(btnUpdate);
        tdActions.appendChild(btnDelete);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}
function deleteUser(id) {
    fetch(`/users/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application'
        }
    }).then(resp => {
        if (!resp.ok) {
            throw new Error('Network response is not ok');
        }
        return resp.json();
    }).then(dataValues => {
        if (dataValues.status == true) {
            window.location.href = '/admin/dashboard';
        }
    }).catch(err => {
        throw new Error(err);
    });
}
function updateUser(email) {
    const modal = document.getElementById('modal');
    modal.style.display = 'block';
    fetch(`/users/${email}`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'Authorization': localStorage.getItem('token')
        }
    }).then(resp => {
        if (!resp.ok) {
            throw new Error('Network response is not ok');
        }
        return resp.json();
    }).then(dataValues => {
        if (dataValues.status == true) {
            document.getElementById('id').value = dataValues.data._id;
            document.getElementById('name').value = dataValues.data.name;
            document.getElementById('email').value = dataValues.data.email;
            document.getElementById('password').value = dataValues.data.password;
            document.getElementById('role').value = dataValues.data.role;
        }
    }).catch(err => {
        throw new Error(err);
    });
}
function createRequestTable(values){
    const tableContainer = document.getElementById('requestTable');
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headers = ['S.No', 'BookId', 'Email', 'addedby', 'status'];
    const trHead = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    values.forEach((item, index) => {
        const tr = document.createElement('tr');
        const tdSno = document.createElement('td');
        tdSno.textContent = index + 1;
        tr.appendChild(tdSno);
        const tdBookId = document.createElement('td');
        tdBookId.textContent = item.bookId;
        tr.appendChild(tdBookId);
        const tdEmail = document.createElement('td');
        tdEmail.textContent = item.email;
        tr.appendChild(tdEmail);
        const tdAddedBy = document.createElement('td');
        tdAddedBy.textContent = item.addedby;
        tr.appendChild(tdAddedBy);
        const tdActions = document.createElement('td');
        tdActions.classList.add('actions');
        const btnApprove = document.createElement('button');
        btnApprove.id = 'approveButton';
        btnApprove.textContent = 'Approve';
        btnApprove.onclick = () => approveUser(item.email,item.bookId);
        const btnDeny = document.createElement('button');
        btnDeny.id = 'denyButton';
        btnDeny.textContent = 'Deny';
        btnDeny.onclick = () =>denyUser(item.email,item.bookId);
        tdActions.appendChild(btnApprove);
        tdActions.appendChild(btnDeny);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}
document.getElementById('close').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
});
window.onclick = function (event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
document.getElementById('updateFormButton').addEventListener('click', () => {
    let id = document.getElementById('id').value;
    let name = document.getElementById('name').value.trim();
    let email = document.getElementById('email').value.trim();
    let password = document.getElementById('password').value.trim();
    let role = document.getElementById('role').value.trim();
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (name === "" || !nameRegex.test(name)) {
        return alert('Enter a valid name');
    }
    if (email === "" || !emailRegex.test(email)) {
        return alert('Enter a valid email');
    }
    if (password === "") {
        alert('Enter a valid password');
        return;
    }
    if (role === "") {
        alert('Enter a valid role');
        return;
    }
    let newData = {
        'name': name,
        'email': email,
        'password': password,
        'role': role
    }
    fetch(`/users/${id}`,{
        method:'PUT',
        headers: {
            'Content-type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body:JSON.stringify(newData)
    }).then(resp => {
        if (!resp.ok) {
            throw new Error('Network response is not ok');
        }
        return resp.json();
    }).then(dataValues => {
        if (dataValues.status == true) {
           console.log('User updated successfully');
           document.getElementById('modal').style.display = 'none';
           window.location.href = '/admin/dashboard';
        }
    }).catch(err => {
        throw new Error(err);
    });
});
function denyUser(email,bookId){
    fetch(`/bookshelf/${bookId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        }
    }).then(resp => {
        if (!resp.ok) {
            throw new Error('Network response is not ok');
        }
        return resp.json();
    }).then(data => {
        if (data.status == true) {
            window.location.href='/admin/dashboard';
        }
        else {
            alert(data.status);
            throw new Error(data.status);
        }
    }).catch(err => {
        alert(err);
        throw new Error(err);
    });
}
function approveUser(email, bookId) {
    let bookData = { email: email };
    fetch(`/bookshelf/${bookId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify(bookData)
    }).then(resp => {
        if (!resp.ok) {
            throw new Error('Network response is not ok');
        }
        return resp.json();
    }).then(data => {
        if (data.status === true) {
            window.location.href = '/admin/dashboard';
        } else {
            alert(data.status);
            throw new Error(data.status);
        }
    }).catch(err => {
        alert(err.message); // Use err.message for more specific error messages
    });
}
document.getElementById('addUserButton').addEventListener('click',()=>{
    const name = document.getElementById('Addname').value.trim();
    const email = document.getElementById('Addemail').value.trim();
    const password = document.getElementById('Addpassword').value.trim();
    const role = document.getElementById('Addrole').value.trim();
    const userData1 = {
        "name": name,
        "email": email,
        "password": password,
        "role":role
    };
    console.log(userData1);
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
    if (role === "") {
        return alert('Confirm password cannot be empty');
    }
    const userData = {
        "name": name,
        "email": email,
        "password": password,
        "role":role
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
            window.location.href='/admin/dashboard';
        } else {
            throw new Error(data1.status);
        }
    })
    .catch(error => {
        alert(error.message);
    });
});
document.getElementById('myForm').addEventListener('submit', (event) => {
    event.preventDefault();
    let title = document.getElementById('title').value.trim();
    let author = document.getElementById('author').value.trim();
    let genre = document.getElementById('genre').value.trim();
    let publication_year = document.getElementById('pub_year').value.trim();
    let language = document.getElementById('language').value.trim();
    let price = document.getElementById('price').value.trim();
    let publisher = document.getElementById('publisher').value.trim();
    let isbn = document.getElementById('isbn').value.trim();
    let rating = document.getElementById('rating').value.trim();
    let url = document.getElementById('url').value.trim();
    if (title === "") {
        alert('Enter a valid title');
        return;
    }
    if (author === "") {
        alert('Enter a valid author');
        return;
    }
    if (genre === "") {
        alert('Enter a valid genre');
        return;
    }
    if (publication_year === "" || isNaN(publication_year)) {
        alert('Enter a valid publication year');
        return;
    }
    if (language === "") {
        alert('Enter a valid language');
        return;
    }
    if (price === "" || isNaN(price)) {
        alert('Enter a valid price');
        return;
    }
    if (publisher === "") {
        alert('Enter a valid publisher');
        return;
    }
    if (isbn === "" || isNaN(isbn)) {
        alert('Enter a valid ISBN');
        return;
    }
    if (rating === "" || isNaN(rating) || parseFloat(rating)>5) {
        alert('Enter a valid rating');
        return;
    }
    if (url === "") {
        alert('Enter a valid URL');
        return;
    }

    let dataValues = {
        title: title,
        author: author,
        genre: genre,
        publication_year: publication_year,
        language: language,
        price: price,
        publisher: publisher,
        isbn: isbn,
        rating: rating,
        url: url
    };

    console.log("New book data:", dataValues);

    fetch('/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
            'Authorization':localStorage.getItem('token')
         },
        body: JSON.stringify(dataValues)
    })
    .then(resp => {
        if (!resp.ok) {
            throw new Error('Network response was not ok');
        }
        return resp.json();
    })
    .then(data => {
       
        if (data.status !== true) {
            console.error('Error:', data.status);
            return;
        }
        document.getElementById('cardContainer').innerHTML='';
        reloadPage();
        console.log('Book added successfully:', data);
        document.getElementById('title').value='';
        document.getElementById('author').value='';
        document.getElementById('genre').value='';
        document.getElementById('pub_year').value='';
        document.getElementById('language').value='';
        document.getElementById('price').value='';
        document.getElementById('publisher').value='';
        document.getElementById('isbn').value='';
        document.getElementById('rating').value='';
        document.getElementById('url').value='';
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });
});