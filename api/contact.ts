import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, company, service, budget, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required" });
  }

  // Create SMTP transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "paxxmo.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true, // true for port 465
    auth: {
      user: process.env.SMTP_USER || "hello@paxxmo.com",
      pass: process.env.SMTP_PASS, // Set this in Vercel environment variables
    },
  });

  // Email content
  const mailOptions = {
    from: `"Paxxmo Website" <${process.env.SMTP_USER || "hello@paxxmo.com"}>`,
    to: process.env.SMTP_TO || "hello@paxxmo.com",
    replyTo: email,
    subject: `New Contact: ${name} - ${service || "General Inquiry"}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Name</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Company</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${company || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Service</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${service || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Budget</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${budget || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Message</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${message.replace(/\n/g, "<br>")}</td>
        </tr>
      </table>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        Sent from Paxxmo website contact form
      </p>
    `,
    text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Company: ${company || "N/A"}
Service: ${service || "N/A"}
Budget: ${budget || "N/A"}

Message:
${message}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("SMTP Error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
