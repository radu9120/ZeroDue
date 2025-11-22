import { NextResponse } from "next/server";
import { getInvoicesList } from "@/lib/actions/invoice.actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = Number(searchParams.get("business_id"));

  if (!businessId || Number.isNaN(businessId)) {
    return NextResponse.json({ error: "Missing business_id" }, { status: 400 });
  }

  const page = Number(searchParams.get("page") || "1") || 1;
  const limit = Number(searchParams.get("limit") || "5") || 5;
  const searchTerm = searchParams.get("searchTerm") || "";
  const filter = searchParams.get("filter") || "";

  try {
    const invoices = await getInvoicesList({
      business_id: businessId,
      page,
      limit,
      searchTerm,
      filter,
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Failed to load invoices", error);
    return NextResponse.json(
      { error: "Failed to load invoices" },
      { status: 500 }
    );
  }
}
