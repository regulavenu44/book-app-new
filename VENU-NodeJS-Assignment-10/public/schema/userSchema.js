const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    role:{type:String,enum:['admin','user'],default:'user'}
});
const users=mongoose.model('users',userSchema);
module.exports=users;