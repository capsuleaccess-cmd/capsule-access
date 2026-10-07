import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAdmin } from "@/lib/auth";

export async function GET() {
  if (!exigerAdmin()) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
  }

  const boutiques = await prisma.boutique.findMany({
    include: { proprietaire: true, produits: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(boutiques);
}
