import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAdmin } from "@/lib/auth";
import { COMMISSION_TAUX } from "@/lib/config";

export async function GET() {
  if (!exigerAdmin()) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
  }

  const [
    totalUtilisateurs,
    totalVendeurs,
    totalBoutiquesNonVerifiees,
    totalProduits,
    totalCommandes,
    litigesOuverts,
    lignesVendues,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "VENDEUR" } }),
    prisma.boutique.count({ where: { verifiee: false } }),
    prisma.produit.count(),
    prisma.commande.count(),
    prisma.litige.count({ where: { statut: { in: ["OUVERT", "EN_EXAMEN"] } } }),
    prisma.ligneCommande.findMany({
      where: { commande: { statut: { in: ["LIVREE", "TERMINEE"] } } },
    }),
  ]);

  const ventesTotales = lignesVendues.reduce(
    (s, l) => s + l.prixUnitaire * l.quantite,
    0
  );
  const revenuCommissions = ventesTotales * COMMISSION_TAUX;

  return NextResponse.json({
    totalUtilisateurs,
    totalVendeurs,
    totalBoutiquesNonVerifiees,
    totalProduits,
    totalCommandes,
    litigesOuverts,
    ventesTotales,
    revenuCommissions,
  });
}
