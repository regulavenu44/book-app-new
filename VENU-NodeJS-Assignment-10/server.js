const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const users = require(path.join(__dirname, 'public', 'schema', 'userSchema.js'));
const Book = require(path.join(__dirname, 'public', 'schema', 'booksSchema.js'));
const bookshelf = require(path.join(__dirname, 'public', 'schema', 'bookShelf.js'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const verifedToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        //return res.redirect('/home');
        res.status(404).json({ status: 'You are not authorized' });
    }
    try {
        const isValid = jwt.verify(token, 'This is my security key');
        req.user = isValid;
        next();
    }
    catch (error) {


        res.status(500).json({ status: 'invalid token' });
    }

}

app.get('/', (req, res) => {
    res.render('index');
});
app.get('/home', (req, res) => {
    res.render('index');
});
app.get('/home/book-:id', (req, res) => {
    res.render('details');
});
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/home', (req, res) => {
    res.render('home');
});
app.get('/admin/signup', (req, res) => {
    res.render('adminSignup');
});
app.get('/profile', (req, res) => {
    res.render('profile');
});
app.get('/admin/dashboard', (req, res) => {
    res.render('dashboard');
});
app.get('/admin/dashboard/book-:id', (req, res) => {
    res.render('details');
});
mongoose.connect(process.env.MONGO_DB)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Could not connect to MongoDB Atlas:', err));

app.get('/books', async (req, res) => {
    try {
        const books = await Book.find(); 
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: 'Query not executed' });
    }
});

app.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id); 
        if (!book) {
            res.status(404).send('Book with specified ID not found');
        } else {
            res.status(200).json(book);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/books',verifedToken, async (req, res) => {
    try {
        const newBook = new Book(req.body);
        newBook['addedby']=req.user.email;
        const result = await newBook.save(); 
        res.status(201).json({ status: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/books/:id', async (req, res) => {
    try {

        const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }); 
        if (!updatedBook) {
            res.status(404).json({ status: 'Book with specified ID not available' });
        } else {
            res.status(200).json({ status: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/books/:id', async (req, res) => {
    try {
        const result = await Book.findByIdAndDelete(req.params.id); 
        if (!result) {
            res.status(404).json({ status: 'The book you are trying to delete is not found' });
        } else {
            res.status(200).json({ status: true });
        }
    } catch (err) {
        res.status(500).json({ status: err.message });
    }
});
app.get('/users', async (req, res) => {
    try {
        const allUsers = await users.find();
        res.status(200).json({ status: true, data: allUsers });
    }
    catch (err) {
        res.status(400).json({ status: err });
    };
});
app.get('/users/:email', async (req, res) => {
    try {
        const user = await users.findOne({ email: req.params.email });
        if (user) {
            res.status(200).json({ status: true, data: user });
        }
        else {
            res.status(200).json({ status: false, data: undefined });
        }
    }
    catch (err) {
        res.status(400).json({ status: err.message });
    }
});
app.get('/users/:id', verifedToken, async (req, res) => {
    try {
        const user = await users.findOne({ _id: req.params.id });
        if (user) {
            res.status(200).json({ status: true, data: user });
        }
        else {
            res.status(200).json({ status: false, data: undefined });
        }
    }
    catch (err) {
        res.status(400).json({ status: err.message });
    }
});
app.delete('/users/:id', async (req, res) => {
    try {
        await users.deleteOne({ _id: req.params.id });
        res.status(200).json({ status: true });
    }
    catch (err) {
        res.status(500).json({ status: err });
    }
});
app.get('/users/:email/:password', async (req, res) => {
    try {
        const user = await users.findOne({ email: req.params.email, password: req.params.password });
        if (user) {
            let token = jwt.sign({ email: req.params.email, role: user.role }, 'This is my security key', {
                expiresIn: '1h'
            });
            res.status(200).json({ status: true, value: token, user: user });
        }
        else {
            res.status(200).json({ status: false });
        }
    }
    catch (err) {
        res.status(400).json({ status: err.message });
    }
});

app.post('/users', async (req, res) => {
    try {
        const newUser = new users(req.body); 
        const result = await newUser.save();
        res.status(201).json({ status: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/users/:id', verifedToken, async (req, res) => {
    try {

        const updatedUser = await users.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedUser) {
            res.status(404).json({ status: 'Book with specified ID not available' });
        } else {
            res.status(200).json({ status: true });
        }
    } catch (err) {
        res.status(500).json({ status: err.message });
    }
});

app.post('/admin', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const sampleuser = {
            name: name,
            email: email,
            password: password
        };
        await admins.create(sampleuser);
        res.status(200).json({ status: true });
    }
    catch (err) {
        res.status(400).json({ status: err.message });
    }
});

app.post('/verify-token', verifedToken, (req, res) => {

    res.status(200).json({ valid: true, user: req.user.email, role: req.user.role });
});

app.post('/bookshelf', async (req, res) => {
    try {
        const isBook = await bookshelf.findOne({ bookId: req.body.bookId });
        if (isBook) {
            if (isBook.status == 'pending') {
                res.status(200).json({ status: false });
            }
            if (isBook.status == 'accepted') {
                res.status(200).json({ status: true });
            }
        }
        else {
            const newBook = new bookshelf(req.body);
            await newBook.save();
            res.status(200).json({ status: false });
        }
    }
    catch (err) {
        res.status(200).json({ status: err });
    }
});
app.delete('/bookshelf/:id', verifedToken, async (req, res) => {
    try {
        await bookshelf.deleteOne({ bookId: req.params.id });
        res.status(200).json({ status: true });
    }
    catch (err) {
        res.status(500).json({ status: err });
    }
});
app.get('/bookshelf/:id', verifedToken, async (req, res) => {
    try {
        const isbook = await bookshelf.findOne({ email: req.user.email, bookId: req.params.id });
        if (isbook) {
            if (isbook.status == "pending") {
                res.status(200).json({ status: 'pending' });
            }
            if (isbook.status == "accepted") {
                res.status(200).json({ status: true });
            }
        } else {
            res.status(200).json({ status: false });
        }
    } catch (err) {
        console.error('Error finding book in bookshelf:', err); // Log error for debugging
        res.status(500).json({ status: 'Error finding book in bookshelf', error: err.message });
    }
});
app.get('/bookshelf', verifedToken, async (req, res) => {
    let booksData = [];
    try {
        let allbooks = await bookshelf.find();
        if (allbooks) {
            for (let i = 0; i < allbooks.length; i++) {
                if (allbooks[i].status == "accepted") {
                    const eachBook = await Book.findOne({ _id: allbooks[i].bookId });
                    if (eachBook) {
                        booksData.push(eachBook);
                    }
                }
            }

            res.status(200).json({ status: true, data: booksData, profile: req.user });
        }
        else {
            res.status(200).json({ status: false, data: booksData, profile: req.user });
        }
    } catch (err) {
        res.status(500).json({ status: err });
    }
});
app.get('/bookshelfall', verifedToken, async (req, res) => {
    let bookData = [];
    try {
        let allbooks = await bookshelf.find();
        if (allbooks) {
            for (let i = 0; i < allbooks.length; i++) {
                if (allbooks[i].status == "pending") {
                    bookData.push(allbooks[i]);
                }
            }
            res.status(200).json({ status: true, data: bookData });
        }
        else {
            res.status(200).json({ status: false, data: [] });

        }
    } catch (err) {
        res.status(200).json({ status: err });
    }
});
app.put('/bookshelf/:id', verifedToken, async (req, res) => {
    const { email } = req.body;
    try {

        const updatedBookshelf = await bookshelf.findOneAndUpdate(
            { bookId: req.params.id },
            {
                email: email,
                addedby: req.user.email,
                status: "accepted"
            }
        );

        if (!updatedBookshelf) {
            return res.status(404).json({ status: false, message: 'Bookshelf item with specified ID not found' });
        }

        return res.status(200).json({ status: true, data: updatedBookshelf });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
});

app.listen(process.env.PORT || 5000, () => {
    console.log("server is running");
});
