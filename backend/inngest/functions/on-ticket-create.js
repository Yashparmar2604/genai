import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";
import User from "../../models/user.js";


export const onTicketCreated=inngest.createFunction(
    { id: "on-ticket-created", retries: 2 },
    { event: "ticket/created" },
    async ({event,step})=>{
        try {

            const {ticketId}=event.data;

            const ticketObject=step.run("fetch-ticket",async ()=>{
                 const ticket=await Ticket.findById(ticketId);

            if(!ticket){
                throw new NonRetriableError("Ticket Not Found");
            }

            return ticketObject;
            
            })

            await step.run("update-ticket-status",async ()=>{
                await Ticket.findByIdAndUpdate(ticket._id,{
                    status:"TODO"
                })
            })


            const aiResponse=await analyzeTicket(ticket);

            const relatedskills=step.run("ai-processing",async ()=>{
                let skills=[];
                if(aiResponse){
                    await Ticket.findByIdAndUpdate(ticket._id,{
                        priority:!["low","medium","high"].includes(aiResponse.priority)?"medium":aiResponse.priority,
                        helpfulNotes:aiResponse.helpfulNotes,
                        status:"IN_PROGRESS",
                        relatedSkills:aiResponse.relatedSkills
                    })

                    skills=aiResponse.relatedSkills;
                }

                return skills
            })

            const moderator=await step.run("assign-moderator",async ()=>{
                let user=await User.findOne({
                    role:"moderator",
                    skills:{
                        $elemMatch:{
                            $regex:relatedskills.join("|"),
                            $options:"i"
                        }
                    }
                })

                if(!user){
                   user = await User.findOne({
                        role:"admin"
                    })
                }

                await Ticket.findOneAndUpdate(ticket._id,{
                    assignedTo:user?._id || null
                })

                return user
            })

            await step.run("send-email-notification",async ()=>{

                const finalTicket=await Ticket.findById(ticket._id);
                if(moderator){
                    await sendMail(
                        moderator.email,
                        "Ticket Assigned",
                        `A New Ticket is assigned to you ${finalTicket.title}`
                    )
                }
            })


            return {success:true}

           
        } catch (err) {
      
                console.error("Error running the steps",err.message);
                return {success:false}
            
        }

    }
)

