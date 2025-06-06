import nodemailer from "nodemailer";

export const sendMail=async(to,subject,text)=>{
    try {
        const transporter=nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure:false,
            auth:{
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }

        })


        const info=await transporter.sendMail({
            from:`Inggest tms`,
            to,
            subject,
            text,
        })


        console.log("Message sent: %s", info.messageId);
        return info;
        
    } catch (error) {
        console.log("Error sending email:", error.message);
        throw new Error("Failed to send email");
        
    }
}