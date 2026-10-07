import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";
import { COMMISSION_TAUX } from "@/lib/config";

export async function GET() {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const boutique = await prisma.boutique.findUnique({
    where: { proprietaireId: session.id },
    include: { produits: true },
  });

  if (!boutique) {
    return NextResponse.json({ erreur: "Aucune boutique." }, { status: 404 });
  }

  // Ventes complétées (livrées ou terminées) contenant au moins un produit de la boutique.
  const lignesVendues = await prisma.ligneCommande.findMany({
    where: {
      produit: { boutiqueId: boutique.id },
      commande: { statut: { in: ["LIVREE", "TERMINEE"] } },
    },
    include: { commande: true, produit: true },
  });

  const revenuBrut = lignesVendues.reduce(
    (s, l) => s + l.prixUnitaire * l.quantite,
    0
  );
  const commission = revenuBrut * COMMISSION_TAUX;
  const revenuNet = revenuBrut - commission;

  const commandesCompletees = new Set(lignesVendues.map((l) => l.commandeId)).size;

  const commandesEnCours = await prisma.commande.count({
    where: {
      lignes: { some: { produit: { boutiqueId: boutique.id } } },
      statut: { in: ["PAYEE", "CONFIRMEE", "EN_PREPARATION", "PRETE", "EN_LIVRAISON"] },
    },
  });

  const produitsEnRupture = boutique.produits.filter((p) => p.stock === 0).length;

  const evaluations = await prisma.evaluation.findMany({
    where: { commande: { lignes: { some: { produit: { boutiqueId: boutique.id } } } } },
  });
  const noteMoyenne =
    evaluations.length > 0
      ? evaluations.reduce((s, e) => s + e.note, 0) / evaluations.length
      : null;

  return NextResponse.json({
    boutique: { nom: boutique.nom, verifiee: boutique.verifiee },
    produitsTotal: boutique.produits.length,
    produitsEnRupture,
    commandesCompletees,
    commandesEnCours,
    revenuBrut,
    commission,
    revenuNet,
    noteMoyenne,
    nombreAvis: evaluations.length,
  });
}
