import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ticketing-system",  // your Inngest project ID (optional)
  signingKey: process.env.INNGEST_SIGNING_KEY,  // mandatory for security
});
