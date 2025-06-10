import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      //fetch ticket from DB
      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

     

      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
      });

      const aiResponse = await analyzeTicket(ticket);

      
         
      const relatedskills = await step.run("ai-processing", async () => {
        let skills = [];
        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: !["low", "medium", "high"].includes(aiResponse.priority)
              ? "medium"
              : aiResponse.priority,
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: aiResponse.relatedSkills,
          });
          skills = aiResponse.relatedSkills;
        }
        return skills;
      });

      

const moderator = await step.run("assign-moderator", async () => {
  try {
    // First try to find a moderator with matching skills
    let user = await User.findOne({
      role: "moderator",
      skills: {
        $in: relatedskills.map(skill => new RegExp(skill, 'i'))
      }
    });

    if (!user) {
      user = await User.findOne({ role: "moderator" });
    }

    if (!user) {
      user = await User.findOne({ role: "admin" });
    }

    if (user) {
      const updatedTicket = await Ticket.findByIdAndUpdate(
        ticket._id,
        {
          assignedTo: user._id,
          status: "IN_PROGRESS"
        },
        { new: true }
      ).populate({
        path: 'assignedTo',
        select: 'name email _id'
      });

      console.log("Assigned moderator:", {
        moderatorId: user._id,
        moderatorName: user.name,
        ticketId: ticket._id
      });

      return user;
    } else {
      console.log("No moderator or admin found to assign ticket:", ticket._id);
      return null;
    }
  } catch (error) {
    console.error("Error assigning moderator:", error);
    throw error;
  }
});
      

      await step.run("send-email-notification", async () => {
        if (moderator) {
          const finalTicket = await Ticket.findById(ticket._id);
          await sendMail(
            moderator.email,
            "Ticket Assigned",
            `A new ticket is assigned to you ${finalTicket.title}`
          );
        }
      });

      return { success: true };
    } catch (err) {
      console.error("❌ Error running the step", err.message);
      return { success: false };
    }
  }
);