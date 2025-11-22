import { NextResponse } from "next/server";
import { getNextInvoiceNumber } from "@/lib/actions/invoice.actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = Number(searchParams.get("business_id"));

  if (!businessId || Number.isNaN(businessId)) {
    return NextResponse.json(
      { error: "business_id query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const invoiceNumber = await getNextInvoiceNumber(businessId);
    return NextResponse.json({ invoice_number: invoiceNumber });
  } catch (error) {
    console.error("Failed to fetch next invoice number", error);
    return NextResponse.json(
      { error: "Unable to fetch next invoice number" },
      { status: 500 }
    );
  }
}
