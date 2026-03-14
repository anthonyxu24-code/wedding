import sgMail from "@sendgrid/mail";

const FROM_ADDRESS = process.env.SENDGRID_FROM || "wedding@example.com";

let apiKeySet = false;

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) throw new Error("SENDGRID_API_KEY not configured");

  if (!apiKeySet) {
    sgMail.setApiKey(apiKey);
    apiKeySet = true;
  }

  await sgMail.send({
    to,
    from: FROM_ADDRESS,
    replyTo: FROM_ADDRESS,
    subject,
    html,
    text,
    headers: {
      "List-Unsubscribe": `<mailto:${FROM_ADDRESS}?subject=unsubscribe>`,
    },
  });
}
