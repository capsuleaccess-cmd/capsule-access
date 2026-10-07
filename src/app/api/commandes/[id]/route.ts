import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const commande = await prisma.commande.findUnique({
    where: { id: params.id },
    include: { lignes: { include: { produit: true } }, adresse: true },
  });

  if (!commande || commande.acheteurId !== session.id) {
    return NextResponse.json({ erreur: "Commande introuvable." }, { status: 404 });
  }

  return NextResponse.json(commande);
}
