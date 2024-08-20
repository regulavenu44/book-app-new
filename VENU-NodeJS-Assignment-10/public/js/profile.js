window.onload = (event) => {
    verifyuser();
    reloadPage();
}
function reloadPage() {
    fetch('/bookshelf', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
         }
    }).then(resp => {
        if (!resp.ok) {
            return console.log('Network response in not ok');
        }
        return resp.json();
    }).then(dataValues => {
        createCards(dataValues.data);
        fillUserDetails(dataValues.profile.email);
    }).catch(err=>{
        console.log(err);
        window.location.href='/home';
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
            image.src = "image/sample.jpg";
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
        let deleteButton = document.createElement('img');
        deleteButton.classList.add('deleteButton');
        deleteButton.id = 'deleteButton';
        deleteButton.src='/image/bin.png';
        deleteButton.style.width='25px';
        deleteButton.style.display='none';
        card.appendChild(deleteButton);
        cardContainer.appendChild(card);
        card.addEventListener('mouseover', () => {
            let deleteButton = card.querySelector('.deleteButton');
            if (deleteButton) {
                deleteButton.style.display = 'block';
            }
        });

        card.addEventListener('mouseout', () => {
            let deleteButton = card.querySelector('.deleteButton');
            if (deleteButton) {
                deleteButton.style.display = 'none';
            }
        });
        image.addEventListener('dblclick', () => {
            window.location.href = `home/book-${cardInfo._id}`;
        });
        deleteButton.addEventListener('click',()=>{
            fetch(`/bookshelf/${cardInfo._id}`, {
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
                    window.location.href='/profile';
                }
                else {
                    throw new Error(data.status);
                }
            }).catch(err => {
                throw new Error(err);
            });
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
            star.innerHTML = `<img src="image/star.png" class="starImage">`;
            container.appendChild(star);
            rating = rating - 1;
        }
        else {
            let star = document.createElement('div');
            star.classList.add('halfStar');
            star.innerHTML = `<img src="image/starhalf.png" class="starImage">`;
            container.appendChild(star);
            rating = rating - 0.5;
        }
    }
    return container;
}
function fillUserDetails(email){
    fetch(`/users/${email}`,{
        method:'GET',
        headers:{'Content-Type':'application/json',
            'Authorization':localStorage.getItem('token')
        }
    }).then(resp=>{
        if(!resp.ok){
            throw new Error('Network response is not ok');
        }
        return resp.json();
    }).then(dataValues=>{
        if(dataValues.status==true){
            document.getElementById('name').textContent=dataValues.data.name;
            document.getElementById('email').textContent=dataValues.data.email;
        }
    }).catch(err=>{
        window.location.href='/home';
    });
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
                throw new Error('Your Session is invalid');
            }
            return resp.json();
        }).then(data => {
            if (data.valid) {
                if(data.role==='admin'){
                        document.getElementById('bookShelf').style.display='none';
                }
            }
            else {
                localStorage.removeItem('token');
                throw new Error('Your Session is invalid');
            }
        }).catch(error => {
            throw new Error('Your Session is invalid');
        });
    }
}
document.getElementById('appTitle').addEventListener('click',()=>{
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
    const token=localStorage.removeItem('token');
    window.location.href='/login';
});
