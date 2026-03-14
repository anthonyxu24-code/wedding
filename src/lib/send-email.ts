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
  if (!FROM_ADDRESS || FROM_ADDRESS === "wedding@example.com") {
    throw new Error("SENDGRID_FROM not configured");
  }

  if (!apiKeySet) {
    sgMail.setApiKey(apiKey);
    apiKeySet = true;
  }

  const payload: Parameters<typeof sgMail.send>[0] = {
    to,
    from: FROM_ADDRESS,
    replyTo: FROM_ADDRESS,
    subject,
    html,
    text,
    headers: {
      "List-Unsubscribe": `<mailto:${FROM_ADDRESS}?subject=unsubscribe>`,
      "X-Priority": "3",
    },
  };
  try {
    await sgMail.send(payload);
  } catch (err) {
    if (err && typeof err === "object" && "response" in err) {
      const body = (err as { response?: { body?: unknown } }).response?.body;
      console.error("SendGrid error:", body || err);
    }
    throw err;
  }
}
