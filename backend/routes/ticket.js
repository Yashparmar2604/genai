import express from "express"
const router=express.Router();
import { authenticate } from "../middleware/auth.js";
import { createTicket, getTicket, getTickets } from "../controllers/ticket.js";

router.get("/",authenticate,getTickets);
router.get("/:id",authenticate,getTicket);
router.post("/",authenticate,createTicket);
 










export default router;
