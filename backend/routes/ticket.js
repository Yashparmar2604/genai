import express from"express"
const router=express.Router();

import {authenticate} from "../middleware/auth.js"
import { createTicket, getModeratorTickets, getTicket, getTickets, getUserTickets, updateTicketStatus } from "../controllers/ticket.js";


router.get("/moderator",authenticate,getModeratorTickets);
router.get("/user",authenticate,getUserTickets);
router.get("/",authenticate,getTickets);

router.get("/:id",authenticate,getTicket);
router.post("/",authenticate,createTicket);
router.patch("/:ticketId/status",authenticate,updateTicketStatus);

export default router