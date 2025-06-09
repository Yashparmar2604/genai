import express from"express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/user.js"
import ticketRoutes from "./routes/ticket.js"
import {serve} from "inngest/express"
import {inngest} from "./inngest/client.js"
import {onUserSignup} from "./inngest/functions/on-signup.js"
import {onTicketCreated} from "./inngest/functions/on-ticket-create.js"

import dotenv from "dotenv";



dotenv.config();
const app =express();

app.use(cors());
app.use(express.json());


app.use("/api/auth",userRoutes);
app.use("/api/tickets",ticketRoutes);

app.use("/api/inngest",serve({
    client:inngest,
    functions:[onUserSignup,onTicketCreated]
}))


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    family: 4 // Use IPv4, skip trying IPv6
})
.then(() => {
    console.log("Connected to MongoDB Atlas");
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.error("MongoDB Connection Error:", {
        message: error.message,
        code: error.code,
        uri: process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@')
    });
    process.exit(1);
});









