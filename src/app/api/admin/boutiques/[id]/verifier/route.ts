import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAdmin } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!exigerAdmin()) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
  }

  const boutique = await prisma.boutique.update({
    where: { id: params.id },
    data: { verifiee: true },
  });

  return NextResponse.json(boutique);
}
