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
        const subject = `Welcome To The App`;
        const message = `Hi,

Thanks For Signing Up. We Are Glad To Have You Onboard.`;

        await sendMail(user.email, subject, message);
      });

      return { success: true };
    } catch (error) {
      console.error("Error Running Step", error.message);
      return { success: false };
    }
  }
);
