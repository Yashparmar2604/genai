import mongoose from "mongoose";

const UserSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unqiue:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:["user","moderator","admin"],
        default:"user",
    },

    skills:[String],
    
    createdAt:{
        type:Date,
        default:Date.now,
    },



});

const User=mongoose.model("User",UserSchema);

export default User;

