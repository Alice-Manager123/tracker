import { upsertCell, deleteRow, getNextPONumber } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PROPERTY_PREFIXES = {
  "135 QP": "QP",
  "2727 MP": "MP",
  "1100 Bur": "BUR",
  "5420 NSR": "NSR"
};

export async function PATCH(req, props) {
  const params = await props.params;
  const { colKey, value } = await req.json();
  await upsertCell(Number(params.id), colKey, value);
  if (colKey === "property" && value && PROPERTY_PREFIXES[value]) {
    const prefix = PROPERTY_PREFIXES[value];
    const po = await getNextPONumber(prefix);
    await upsertCell(Number(params.id), "poNumber", po);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_, props) {
  const params = await props.params;
  await deleteRow(Number(params.id));
  return NextResponse.json({ ok: true });
}
