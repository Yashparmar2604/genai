import { inngest } from "../client.js";

import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },

  async ({ event, step }) => {
    try {
      const { email } = event.data;

      const user = await step.run("get-user-email", async () => {
        const userObject = await User.findOne({ email });
        if (!userObject) {
          throw new NonRetriableError("user not longer exits in our database");
        }

        return userObject;
      });

      await step.run("send-welcome-email", async () => {
        const subject = `Welcome to Support Hub - Your Ticket Management Solution`;
        const message = `Dear ${user.name},

Welcome to Support Hub! 🎉 We're thrilled to have you join our platform.

Here's what you can do with your account:
• Create and track support tickets
• Get AI-powered assistance for your issues
• Communicate with our expert moderators
• Access real-time status updates

Getting Started:
1. Log in to your account
2. Create your first support ticket
3. Our AI will automatically assign the best moderator for your issue

Need Help?
If you have any questions or need assistance, simply create a ticket and our team will be happy to help.

Best regards,
The Support Hub Team

Note: This is an automated message. Please do not reply to this email.`;

        await sendMail(user.email, subject, message);
      });

      return { success: true };
    } catch (error) {
      console.error("Error Running Step", error.message);
      return { success: false };
    }
  }
);
