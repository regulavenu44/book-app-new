const mongoose=require('mongoose');
const bookShelfSchema=new mongoose.Schema({
    email:String,
    bookId:String,
    status:{type:String,enum:['pending','accepted'],default:'pending'},
    addedby:String
});
const bookshelf=mongoose.model('bookshelf',bookShelfSchema);
module.exports=bookshelf;