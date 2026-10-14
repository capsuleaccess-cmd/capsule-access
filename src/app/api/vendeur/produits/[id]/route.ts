import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connect\u00e9." }, { status: 401 });
  }

  const boutique = await prisma.boutique.findUnique({
    where: { proprietaireId: session.id },
  });
  if (!boutique) {
    return NextResponse.json({ erreur: "Aucune boutique trouv\u00e9e." }, { status: 404 });
  }

  const produit = await prisma.produit.findUnique({ where: { id: params.id } });
  if (!produit || produit.boutiqueId !== boutique.id) {
    return NextResponse.json({ erreur: "Produit introuvable." }, { status: 404 });
  }

  const dejaCommande = await prisma.ligneCommande.count({
    where: { produitId: produit.id },
  });
  if (dejaCommande > 0) {
    return NextResponse.json(
      { erreur: "Ce produit a d\u00e9j\u00e0 \u00e9t\u00e9 command\u00e9, il ne peut pas \u00eatre supprim\u00e9." },
      { status: 409 }
    );
  }

  await prisma.$transaction([
    prisma.lignePanier.deleteMany({ where: { produitId: produit.id } }),
    prisma.produit.delete({ where: { id: produit.id } }),
  ]);

  return NextResponse.json({ ok: true });
}