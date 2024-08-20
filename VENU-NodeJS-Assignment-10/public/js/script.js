window.onload = (event) => {
    verifyuser();
    reloadPage();
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
        let add = document.createElement('img')
        add.classList.add('favButton');
        add.id = 'favButton';
        fillFavImage(add, cardInfo._id);
        add.style.width = '25px';
        card.appendChild(add);
        cardContainer.appendChild(card);
        add.addEventListener('click', () => {
            addtoFav(add, cardInfo._id);
        });
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
            window.location.href = `home/book-${cardInfo._id}`;
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
                if(data.role==='admin'){
                    showInvalidSession('Your are not authorized as admin');
                }
                else{
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
function addtoFav(button, id) {
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
                const email = data.user;
                const bookData = {
                email: email,
                bookId: id,
                status:'pending',
                addedby:'none'
                }
                fetch(`/bookshelf`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookData)
                }).then(resp => {
                    if (!resp.ok) {
                        throw new Error('Network response is not ok');
                    }
                    return resp.json();
                }).then(async (data) => {
                    if (data.status == true) {
                        button.src = '/image/redHeart.jpg';
                        fetch(`/bookshelf/${id}`, {
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
                                button.src = '/image/whiteHeart.png';
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
                    else if (data.status == false) {
                        button.src = '/image/grayHeart.png';
                    }
                    else {
                        throw new Error(data.status);
                    }
                }).catch(error => {
                    alert(error);
                    throw new Error(error);
                });
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
function fillFavImage(button, id) {
    fetch(`/bookshelf/${id}`, {
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
    }).then(data => {
        if (data.status == true) {
            button.src = '/image/redHeart.png';
        }
        else if (data.status == false) {
            button.src = '/image/whiteHeart.png';
        }
        else if(data.status == "pending") {
            button.src = '/image/grayHeart.png';
        }else{
            throw new Error(data.status);
        }
    }).catch(err=>{
        throw new Error(err);
    })
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