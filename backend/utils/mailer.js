import nodemailer from "nodemailer";

const isProduction = process.env.NODE_ENV;



export const sendMail = async(to, subject, text) => {
    try {

        console.log(process.env.NODE_ENV);
        const transporter = nodemailer.createTransport(
            process.env.NODE_ENV ? 
            {
                // Production Gmail configuration
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_PASS,
                }
            } : 
            {
                // Development Mailtrap configuration
                host: process.env.MAILTRAP_SMTP_HOST,
                port: process.env.MAILTRAP_SMTP_PORT,
                secure: false,
                auth: {
                    user: process.env.MAILTRAP_SMTP_USER,
                    pass: process.env.MAILTRAP_SMTP_PASS
                }
            }
        );

        const info = await transporter.sendMail({
            from: isProduction ? 
                  `"Your App" <${process.env.GMAIL_USER}>` : 
                  'Inngest TMS <no-reply@inngest.com>',
            to,
            subject,
            text,
        });

        console.log(`Email sent ${process.env.NODE_ENV ? 'to recipient' : 'to Mailtrap'}: ${info.messageId}`);
        return info;
        
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw new Error("Failed to send email");
    }
}