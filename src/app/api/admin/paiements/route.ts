import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAdmin } from "@/lib/auth";

export async function GET() {
  if (!exigerAdmin()) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
  }

  const commandes = await prisma.commande.findMany({
    where: { statutPaiement: "EN_ATTENTE_VERIFICATION" },
    include: { acheteur: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(commandes);
}
