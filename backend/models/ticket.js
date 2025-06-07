import mongoose from "mongoose";
import User from "./user.js";

const TicketSchema=new mongoose.Schema({

    title:String,
    description:String,
    status:{
        type:String,
        default:"TODO",
    },

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User,
    },
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User,
        default:null
    },
    priority:String,
    deadline:Date,
    helpfulNotes:String,
    relatedSkills:[String],
    createdAt:{
        type:Date,
        default:Date.now,
    }

})

const Ticket=mongoose.model("Ticket",TicketSchema);

export default Ticket;
