import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    if (!resend) {
      console.error("Resend client not initialised: missing RESEND_API_KEY");
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 500 }
      );
    }

    await resend.emails.send({
      from: "InvoiceFlow Notifications <notifications@invcyflow.com>",
      to: ["verositeltd@gmail.com"],
      replyTo: [email],
      subject: `Cookie policy enquiry from ${name}`,
      text: `You have received a new message via the InvoiceFlow cookie policy contact form.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send contact email", error);
    return NextResponse.json(
      { error: "Unable to send message right now." },
      { status: 500 }
    );
  }
}
