window.onload = function () {
    verifyuser();
    fetchDetails();
}
window.onclick=function(event){
    const modal=document.getElementById('modal');
    if(event.target==modal){
        modal.style.display='none';
    }
}
document.getElementById('updateForm').addEventListener('submit', (event) => {
    event.preventDefault();
    document.getElementById('modal').style.display = "none";
    let id = document.getElementById('id').value.trim();
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
    if (rating === "" || isNaN(rating) || parseFloat(rating) > 5) {
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

    fetch(`/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
            fetchDetails();
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });

});
document.getElementById('editButton').addEventListener('click', () => {
    let modal = document.getElementById('modal');
    modal.style.display = "block";
    let lastPart = window.location.pathname.split('/').pop();
    let Id = lastPart.split('-').pop();
    fetch(`/books/${Id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(resp => {
        if (!resp.ok) {
            alert('Network response is not ok');
            throw new Error('Network response is not ok');
        }
        return resp.json();
    }).then(data => {
        console.log(data);
        document.getElementById('id').value=data._id;
        document.getElementById('title').value=data.title;
        document.getElementById('author').value=data.author;
        document.getElementById('genre').value=data.genre;
        document.getElementById('pub_year').value=data.publication_year;
        document.getElementById('language').value=data.language;
        document.getElementById('price').value=data.price.$numberDecimal;
        document.getElementById('publisher').value=data.publisher;
        document.getElementById('isbn').value=data.isbn;
        document.getElementById('rating').value=data.rating.$numberDecimal;
        document.getElementById('url').value=data.url;
    });
});

document.getElementById('deleteButton').addEventListener('click',()=>{
    let lastPart=window.location.pathname.split('/').pop();
    let Id=lastPart.split('-').pop();
    fetch(`/books/${Id}`,{
        method:'DELETE',
        headers:{'Content-Type':'application/json'}
    }).then(resp=>{
        if(!resp.ok){
            alert("Network response is not ok");
            throw new Error('Network response is not ok');
        }
        return resp.json();
    }).then(data=>{
        if(data.status!==true){
            alert(data.status);
            throw new Error(data.status);
        }
        window.location.href='/home';
    }).catch(error=>{
        throw new Error('fetch error : '+error);
    });
});

document.getElementById('close').addEventListener('click', () => {
    let modal = document.getElementById('modal');
    modal.style.display = "none";
});
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
        }).then(async (data) => {
            if (data.valid) {
                if(data.role==='admin'){
                        document.getElementById('userName').textContent = data.user;
                }

                if(data.role==='user'){
                        let db=document.getElementById('deleteButton');
                        let eb=document.getElementById('editButton');
                        if(eb){
                            eb.style.display='none';
                        }
                        if(db){
                            db.style.display='none';
                        }
                        document.getElementById('userName').textContent = data.user;
                }
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
    let container2 = document.getElementById('container2');
    // container2.innerHTML=``;
    // container2.style.border='none';
    container2.style.display = 'none';
    let myModal = document.getElementById('sessionModal');
    myModal.style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}
function fetchDetails() {
    const lastPart = window.location.pathname.split('/').pop();
    const Id = lastPart.split('-').pop();
    console.log(Id);
    fetch(`/books/${Id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(resp => {
        if (!resp.ok) {
            let container = document.getElementById('mainContainer');
            container.innerHTML = '';
            container.innerHTML = `
            <p style="font-weight:bold;font-size:80px;">404 Not found</p>
            `;
            container.style.padding = "40dp";
            container.style.border = "2px solid black";
            container.style.display = "flex";
            container.style.justifyContent = "center";
            container.style.padding = "5px";
            throw new Error('Network response is not ok');
        }
        return resp.json();
    }).then(data => {
        setDetails(data);
    });
}
function setDetails(details) {
    let bookImage = document.getElementById('bookImage');
    bookImage.src = details.url;
    bookImage.onerror = function () {
        bookImage.src ='/image/sample.jpg';
    }
    let bookName = document.getElementById('bookName');
    bookName.textContent = details.title;
    let addedby=document.getElementById('addedby');
    addedby.textContent=details.addedby;
    let div=document.getElementById('ratingTextContainer');
    if(div){
        div.remove();
        document.getElementById('starContainer').remove();
    }
    let ratingTextContainer = document.createElement('div');
    ratingTextContainer.id='ratingTextContainer';
    ratingTextContainer.style.paddingLeft = '3px';
    let ratingText = document.createElement('p');
    ratingText.textContent = `( ${details.rating.$numberDecimal} / 5)`;
    ratingTextContainer.appendChild(ratingText);

    let ratingContainer = setRating(details.rating.$numberDecimal);

    let ratingBar = document.createElement('div');
    ratingBar.style.display = 'flex';
    ratingBar.style.flexDirection = 'row';
    ratingBar.style.alignItems = 'center';
    ratingBar.appendChild(ratingContainer);
    ratingBar.appendChild(ratingTextContainer);

    document.getElementById('nameContainer').appendChild(ratingBar);
    let price = document.getElementById('bookPrice');
    price.textContent = "$ " + details.price.$numberDecimal;
    let list1 = document.getElementById('list1');
    let list2 = document.getElementById('list2');
    list1.innerHTML = `
    <li><span style="font-weight:bold">Author</span> : ${details.author}</li>
    <li><span style="font-weight:bold">isbn</span>    : ${details.isbn}</li>
    <li><span style="font-weight:bold">genre</span>   : ${details.genre}</li>
    `;
    list2.innerHTML = `
    <li><span style="font-weight:bold">Publication Year</span>  : ${details.publication_year}</li>
    <li><span style="font-weight:bold">Language</span>          : ${details.language}</li>
    <li><span style="font-weight:bold">publisher</span>         :${details.publisher}</li>
    `;
}
function setRating(rating) {
    let container = document.createElement('div');
    container.classList.add('starContainer');
    container.id='starContainer';
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
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    return container;
}
document.getElementById('titleContainer').addEventListener('click',()=>{
    fetch('/verify-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        }
    }).then(resp => {
        if (!resp.ok) {
            showInvalidSession('Your Session is invalid');
        }
        return resp.json();
    }).then(data => {
        if (data.valid) {
            if(data.role==='user'){
                window.location.href='/home';
            }
            else{
                window.location.href='/admin/dashboard';
            }
        }
        else {
            localStorage.removeItem('token');
            showInvalidSession('Your Session is invalid');
        }
    }).catch(error => {
        showInvalidSession(error);
    });
});
document.getElementById('actionContainer').addEventListener('click',()=>{
    window.location.href='/profile';
});
document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('sessionModal').style.display = 'none';
});
document.getElementById('gotoLogin').addEventListener('click', () => {
    window.location.href = '/login';
});