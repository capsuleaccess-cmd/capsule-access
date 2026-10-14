import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";

export async function GET() {
  const session = lireUtilisateurCourant();

  if (!session) {
    return NextResponse.json(
      { erreur: "Non connecté." },
      { status: 401 }
    );
  }

  const boutique = await prisma.boutique.findUnique({
    where: { proprietaireId: session.id },
  });

  if (!boutique) {
    return NextResponse.json(
      { erreur: "Aucune boutique trouvée." },
      { status: 404 }
    );
  }

  const produits = await prisma.produit.findMany({
    where: { boutiqueId: boutique.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(produits);
}
