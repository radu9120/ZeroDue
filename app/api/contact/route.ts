import { NextResponse } from "next/server";
import { Resend } from "resend";

// Lazy initialize Resend to avoid build-time errors when env var is not set
let resend: Resend | null = null;
function getResendClient(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { name, email, message } = body as {
      name?: string;
      email?: string;
      message?: string;
    };

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("Resend API key not configured");
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 500 }
      );
    }

    // Send email using Resend
    const { data, error } = await getResendClient().emails.send({
      from: "InvoiceFlow <contact@invcyflow.com>",
      to: ["verositeltd@gmail.com"],
      replyTo: email,
      subject: `Cookie Policy Question from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">New Cookie Policy Question</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="margin-top: 0; color: #667eea; font-size: 18px;">Contact Information</h2>
                <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #667eea;">${email}</a></p>
              </div>

              <div style="background: white; padding: 20px; border-radius: 8px;">
                <h2 style="margin-top: 0; color: #667eea; font-size: 18px;">Message</h2>
                <p style="white-space: pre-wrap; margin: 0;">${message}</p>
              </div>

              <div style="margin-top: 20px; padding: 15px; background: #e0e7ff; border-radius: 8px; border-left: 4px solid #667eea;">
                <p style="margin: 0; font-size: 14px; color: #4338ca;">
                  💡 <strong>Tip:</strong> Reply directly to this email to respond to ${name}
                </p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Sent from InvoiceFlow Cookie Policy Page<br>
                <a href="https://invcyflow.com/cookies" style="color: #667eea;">View Cookie Policy</a>
              </p>
            </div>
          </body>
        </html>
      `,
      text: `New Cookie Policy Question

From: ${name}
Email: ${email}

Message:
${message}

---
Reply directly to this email to respond to ${name}`,
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    console.log("Contact email sent successfully:", data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send contact email", error);
    return NextResponse.json(
      { error: "Unable to send message right now." },
      { status: 500 }
    );
  }
}
