const mongoose=require('mongoose');
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 255
    },
    author: {
        type: String,
        required: true,
        maxlength: 255
    },
    genre: {
        type: String,
        required: true,
        maxlength: 255
    },
    publication_year: {
        type: Number,
        required: true
    },
    language: {
        type: String,
        maxlength: 50,
        default: null
    },
    price: {
        type: mongoose.Schema.Types.Decimal128,
        default: null
    },
    isbn: {
        type: String,
        maxlength: 13,
        default: null
    },
    publisher: {
        type: String,
        maxlength: 255,
        default: null
    },
    rating: {
        type: mongoose.Schema.Types.Decimal128,
        default: null
    },
    url: {
        type: String,
        maxlength: 1000,
        default: null
    },
    addedby:{
        type:String,
        maxlength:50,
        default:null
    }
});
const books=mongoose.model('books',bookSchema);
module.exports=books;