import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";
import { sendMail } from "../utils/mailer.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }
    const newTicket = Ticket.create({
      title,
      description,
      createdBy: req.user._id.toString(),
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: (await newTicket)._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });
    return res.status(201).json({
      message: "Ticket created and processing started",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];
    if (user.role !== "user") {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "name", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({})
        .select("title description status createdAt")
        .populate("assignedTo", ["name"])
        .sort({ createdAt: -1 });
    }
    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    let ticket;

    if (user.role === "admin") {
      ticket = await Ticket.findById(id)
        .populate("assignedTo", ["name", "email", "_id"])
        .populate("createdBy", ["name", "email"]);
    } else {
      ticket = await Ticket.findOne({
        $or: [
          { createdBy: user._id },
          { assignedTo: user._id }
        ],
        _id: id
      })
      .populate("assignedTo", ["name", "email", "_id"])
      .populate("createdBy", ["name", "email"]);
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    const user = req.user;

    const ticket = await Ticket.findById(ticketId)
    .populate('createdBy',['email','name'])
    .populate('assignedTo',['name','email']);


    if (!ticket) {
      return res.status(404).json({
        message: "Ticket Not Found",
      });
    }

    if (
      user.role !== "admin" &&
      (user.role !== "moderator" ||
        ticket.assignedTo?._id.toString() !== user._id.toString())
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this ticket" });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true }
    ).populate("assignedTo", ["name", "email","_id"]);


       console.log(ticket.createdBy);

        if (status === "COMPLETED" && ticket.createdBy) {
      try {
        await sendMail(
          ticket.createdBy.email,
          "Ticket Resolved",
          `Your ticket "${ticket.title}" has been resolved by ${ticket.assignedTo.name}.

Ticket Details:
- Title: ${ticket.title}
- Description: ${ticket.description}
- Resolution Date: ${new Date().toLocaleString()}
- Resolved by: ${ticket.assignedTo.name}

Thank you for using our support system!`
        );
      } catch (emailError) {
        console.error("Error sending completion email:", emailError);
        // Don't return here - we still want to update the ticket even if email fails
      }
    }

    return res.json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const getUserTickets = async (req,res) =>{

    try {
      const tickets=await Ticket.find({createdBy:req.user._id})
      .select("title description status createdAt priority")
      .populate("assignedTo",["name"])
      .sort({createdAt:-1});

      return res.status(200).json(tickets);
    } catch (error) {
       console.error("Error fetching user tickets:", error);
      return res.status(500).json({ message: "Failed to fetch tickets" });

    }

}



export const getModeratorTickets = async (req,res)=>{
  try {

    if (req.user.role !== "moderator") {
      return res.status(403).json({ 
        message: "Access denied. Moderators only." 
      });
    }
     
      const tickets=await Ticket.find({assignedTo:req.user._id})
      .populate("createdAt",["name","email"])
      .populate("assignedTo",["name","email"])
      .sort({createdAt:-1});

      return res.status(200).json(tickets);
  } catch (error) {
    
    console.error("Error fetching moderator tickets:", error);
    return res.status(500).json({ message: "Failed to fetch tickets" });
  }
}