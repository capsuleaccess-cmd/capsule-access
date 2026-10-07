import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";

export async function GET() {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const boutique = await prisma.boutique.findUnique({
    where: { proprietaireId: session.id },
  });
  if (!boutique) {
    return NextResponse.json([]);
  }

  const commandes = await prisma.commande.findMany({
    where: {
      lignes: { some: { produit: { boutiqueId: boutique.id } } },
      statut: { in: ["CONFIRMEE", "EN_PREPARATION", "PRETE", "EN_LIVRAISON"] },
    },
    include: {
      lignes: { include: { produit: true } },
      adresse: true,
      agentLivraison: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const livreurs = await prisma.agentLivraison.findMany({
    where: { boutiqueId: boutique.id },
    orderBy: { nom: "asc" },
  });

  return NextResponse.json({ commandes, livreurs });
}
