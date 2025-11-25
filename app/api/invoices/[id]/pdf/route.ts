import { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "../../../../../lib/supabase";
import { auth } from "@/lib/auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!id) return new Response("Invalid id", { status: 400 });

    const supabase = createSupabaseAdminClient();
    const { data: invoice, error } = await supabase
      .from("Invoices")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !invoice)
      return new Response(error?.message || "Not found", { status: 404 });

    // Authorize: ensure the requesting user owns this invoice
    if (invoice.author && invoice.author !== userId) {
      return new Response("Forbidden", { status: 403 });
    }

    // Try to locate a company logo URL from common fields. These schema names are inferred
    // from the app; if your project uses a different field, we'll fall back to no-logo.
    // company_details may be JSON or string; parse safely
    let companyDetails: any = invoice.company_details || null;
    try {
      if (typeof companyDetails === "string") {
        companyDetails = JSON.parse(companyDetails);
      }
    } catch {
      companyDetails = invoice.company_details; // leave as-is
    }

    const logoUrl =
      companyDetails?.logo_url ||
      companyDetails?.logo ||
      invoice.logo_url ||
      null;

    let logoBytes: Uint8Array | null = null;
    if (logoUrl) {
      try {
        const r = await fetch(logoUrl);
        if (r.ok) {
          const ab = await r.arrayBuffer();
          logoBytes = new Uint8Array(ab);
        }
      } catch (e) {
        // ignore logo fetch failure and continue without logo
        logoBytes = null;
      }
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points (72dpi)
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { width, height } = page.getSize();
    const margin = 40;

    // Header: company name on the left
    const companyName =
      invoice.company_details?.name || invoice.business_name || "Your Company";
    page.drawText(String(companyName), {
      x: margin,
      y: height - margin - 6,
      size: 16,
      font: helvetica,
      color: rgb(0.07, 0.07, 0.07),
    });

    // Logo on the top-right if available
    if (logoBytes) {
      try {
        let img: any;
        try {
          img = await pdfDoc.embedPng(logoBytes);
        } catch (err) {
          img = await pdfDoc.embedJpg(logoBytes);
        }
        const imgDims = img.scale(1);
        const targetW = 140;
        const targetH = (imgDims.height / imgDims.width) * targetW;
        page.drawImage(img, {
          x: width - margin - targetW,
          y: height - margin - targetH,
          width: targetW,
          height: targetH,
        });
      } catch (e) {
        // silently ignore embedding errors
      }
    }

    // Invoice metadata
    const invoiceNumber =
      invoice.invoice_number || invoice.number || `#${invoice.id}`;
    const issueDate = new Date(
      invoice.created_at || invoice.issued_at || Date.now()
    ).toLocaleDateString("en-GB");
    page.drawText(`Invoice: ${invoiceNumber}`, {
      x: margin,
      y: height - margin - 36,
      size: 10,
      font: helvetica,
    });
    page.drawText(`Date: ${issueDate}`, {
      x: margin,
      y: height - margin - 52,
      size: 10,
      font: helvetica,
    });

    // Table header
    const tableTop = height - margin - 110;
    const colX = [margin, 320, 380, 460];
    page.drawText("Description", {
      x: colX[0],
      y: tableTop,
      size: 10,
      font: helvetica,
    });
    page.drawText("Qty", {
      x: colX[1],
      y: tableTop,
      size: 10,
      font: helvetica,
    });
    page.drawText("Price", {
      x: colX[2],
      y: tableTop,
      size: 10,
      font: helvetica,
    });
    page.drawText("Total", {
      x: colX[3],
      y: tableTop,
      size: 10,
      font: helvetica,
    });

    // Items
    // Items may be stored as JSON text; parse if necessary
    let items = invoice.items || invoice.line_items || [];
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        items = [];
      }
    }
    let y = tableTop - 18;
    if (!Array.isArray(items) || items.length === 0) {
      page.drawText("(no items)", { x: colX[0], y, size: 10, font: helvetica });
      y -= 14;
    } else {
      for (const it of items) {
        const desc = it.description || it.label || it.name || "";
        const qty =
          typeof it.quantity !== "undefined" ? it.quantity : (it.qty ?? 1);
        const price =
          typeof it.unit_price !== "undefined"
            ? it.unit_price
            : (it.price ?? it.rate ?? 0);
        const rowTotal =
          typeof it.total !== "undefined" ? it.total : price * qty;

        // simple text draw (no complex wrapping)
        page.drawText(String(desc), {
          x: colX[0],
          y,
          size: 9,
          font: helvetica,
          color: rgb(0, 0, 0),
        });
        page.drawText(String(qty), { x: colX[1], y, size: 9, font: helvetica });
        page.drawText(`£${Number(price).toFixed(2)}`, {
          x: colX[2],
          y,
          size: 9,
          font: helvetica,
        });
        page.drawText(`£${Number(rowTotal).toFixed(2)}`, {
          x: colX[3],
          y,
          size: 9,
          font: helvetica,
        });
        y -= 16;
        if (y < margin + 120) break; // don't paginate in this lightweight implementation
      }
    }

    // Totals area
    const subtotal =
      typeof invoice.subtotal !== "undefined"
        ? invoice.subtotal
        : Array.isArray(items)
          ? items.reduce(
              (s: number, it: any) =>
                s +
                (it.total ??
                  (it.unit_price ?? it.price ?? 0) *
                    (it.quantity ?? it.qty ?? 1)),
              0
            )
          : 0;
    const tax = invoice.tax ?? invoice.vat ?? 0;
    const total = invoice.total ?? invoice.amount_due ?? subtotal + tax;

    const totalsX = width - margin - 200;
    page.drawText(`Subtotal: £${Number(subtotal).toFixed(2)}`, {
      x: totalsX,
      y: margin + 70,
      size: 10,
      font: helvetica,
    });
    page.drawText(`Tax: £${Number(tax).toFixed(2)}`, {
      x: totalsX,
      y: margin + 56,
      size: 10,
      font: helvetica,
    });
    page.drawText(`Total: £${Number(total).toFixed(2)}`, {
      x: totalsX,
      y: margin + 38,
      size: 12,
      font: helvetica,
    });

    const pdfBytes = await pdfDoc.save();
    const uint8 = new Uint8Array(pdfBytes);

    return new Response(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${id}.pdf`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(`PDF generation failed: ${msg}`, { status: 500 });
  }
}
