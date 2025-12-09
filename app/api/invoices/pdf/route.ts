import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInvoiceHTML } from "@/lib/invoice-pdf-html";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
    console.log(
      "[PDF] Company logo URL:",
      business.logo ? business.logo.substring(0, 100) : "NO LOGO"
    );
    const html = generateInvoiceHTML(invoice, business);

    // For Vercel serverless, use @sparticuz/chromium
    const isVercel =
      process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME;

    if (isVercel) {
      // Vercel/AWS Lambda environment
      browser = await puppeteer.launch({
        args: chromium.args,
        // chromium.defaultViewport is not exposed; set our own explicit viewport
        defaultViewport: { width: 1280, height: 1800 },
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      // Local development - use regular puppeteer
      const puppeteerFull = await import("puppeteer");
      browser = await puppeteerFull.default.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 20000,
    });

    // Generate PDF - no margins for full-bleed design
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
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
