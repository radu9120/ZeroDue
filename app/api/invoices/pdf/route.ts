import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInvoiceHTML } from "@/lib/invoice-pdf-html";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  let browser = null;

  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoice_id");
    const businessId = searchParams.get("business_id");

    if (!invoiceId || !businessId) {
      return NextResponse.json(
        { error: "Missing invoice_id or business_id" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("Invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error("Invoice fetch error:", invoiceError);
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Fetch business
    const { data: business, error: businessError } = await supabase
      .from("Businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (businessError || !business) {
      console.error("Business fetch error:", businessError);
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Generate HTML
    const html = generateInvoiceHTML(invoice, business);

    // Dynamic import puppeteer to avoid build issues
    const puppeteer = await import("puppeteer");

    // Launch Puppeteer with more options for macOS
    browser = await puppeteer.default.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "15mm",
        right: "15mm",
        bottom: "15mm",
        left: "15mm",
      },
    });

    await browser.close();
    browser = null;

    // Convert Uint8Array to Buffer for NextResponse
    const buffer = Buffer.from(pdfBuffer);

    // Return PDF
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${invoice.invoice_number || invoiceId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error("Error closing browser:", e);
      }
    }
    return NextResponse.json(
      { error: "Failed to generate PDF", details: String(error) },
      { status: 500 }
    );
  }
}
