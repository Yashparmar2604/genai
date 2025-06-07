import nodemailer from "nodemailer";

const isProduction = false;

export const sendMail = async(to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport(
            isProduction ? 
            {
                // Production Gmail configuration
                service: 'gmail',
                auth: {
                    user: "yp842694@gmail.com",
                    pass: "rncdxqancoyzcwpr"
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

        console.log(`Email sent ${isProduction ? 'to recipient' : 'to Mailtrap'}: ${info.messageId}`);
        return info;
        
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw new Error("Failed to send email");
    }
}