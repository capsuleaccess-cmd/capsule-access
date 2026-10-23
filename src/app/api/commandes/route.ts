import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";
import { calculerFraisLivraison } from "@/lib/fraisTransport";
import { genererCodeCommande } from "@/lib/codeCommande";

export async function POST(req: NextRequest) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const { adresseId, villeDestination } = await req.json();
  if (!adresseId || !villeDestination) {
    return NextResponse.json(
      { erreur: "adresseId et villeDestination sont requis." },
      { status: 400 }
    );
  }

  const adresse = await prisma.adresse.findUnique({ where: { id: adresseId } });
  if (!adresse || adresse.userId !== session.id) {
    return NextResponse.json({ erreur: "Adresse invalide." }, { status: 400 });
  }

  const panier = await prisma.panier.findUnique({
    where: { userId: session.id },
    include: { lignes: { include: { produit: true } } },
  });

  if (!panier || panier.lignes.length === 0) {
    return NextResponse.json({ erreur: "Le panier est vide." }, { status: 400 });
  }

  // Détecte si au moins un produit doit être expédié hors de sa ville
  // d'origine, et vérifie les quantités disponibles en conséquence.

  for (const ligne of panier.lignes) {
    if (ligne.quantite > ligne.produit.stock) {
      return NextResponse.json(
        { erreur: `Stock insuffisant pour "${ligne.produit.nom}".` },
        { status: 400 }
      );
    }

    if (ligne.produit.villeOrigine !== villeDestination) {
      if (ligne.quantite > ligne.produit.quantiteExpediable) {
        return NextResponse.json(
          {
            erreur: `"${ligne.produit.nom}" n'est expédiable qu'à hauteur de ${ligne.produit.quantiteExpediable} unité(s) hors de sa ville d'origine.`,
          },
          { status: 400 }
        );
      }
    }
  }

  // Une commande par boutique : chaque vendeur valide, prepare et expedie la sienne.
  const groupes = new Map<string, typeof panier.lignes>();
  for (const ligne of panier.lignes) {
    const liste = groupes.get(ligne.produit.boutiqueId) ?? [];
    liste.push(ligne);
    groupes.set(ligne.produit.boutiqueId, liste);
  }

  const preparees: {
    lignes: typeof panier.lignes;
    totalProduits: number;
    fraisLivraison: number;
    typeLivraison: "LOCALE" | "EXPEDITION";
  }[] = [];

  for (const lignes of Array.from(groupes.values())) {
    const frais = calculerFraisLivraison(
      lignes.map((l) => ({
        quantite: l.quantite,
        produit: {
          nom: l.produit.nom,
          boutiqueId: l.produit.boutiqueId,
          villeOrigine: l.produit.villeOrigine,
          fraisTransport: l.produit.fraisTransport,
          fraisExpedition: l.produit.fraisExpedition,
        },
      })),
      villeDestination
    );
    if (!frais.ok) {
      return NextResponse.json({ erreur: frais.erreur }, { status: 400 });
    }
    preparees.push({
      lignes,
      totalProduits: lignes.reduce((s, l) => s + l.produit.prix * l.quantite, 0),
      fraisLivraison: frais.total,
      typeLivraison: frais.typeLivraison,
    });
  }

  const codes: string[] = [];
  for (let i = 0; i < preparees.length; i++) {
    codes.push(await genererCodeCommande(villeDestination, i));
  }

  const commandes = await prisma.$transaction(async (tx) => {
    const creees = [];
    for (let i = 0; i < preparees.length; i++) {
      const p = preparees[i];
      const nouvelle = await tx.commande.create({
        data: {
          codeCommande: codes[i],
          acheteurId: session.id,
          adresseId,
          villeDestination,
          typeLivraison: p.typeLivraison,
          totalProduits: p.totalProduits,
          fraisLivraison: p.fraisLivraison,
          totalPaye: p.totalProduits + p.fraisLivraison,
          statut: "EN_ATTENTE",
          lignes: {
            create: p.lignes.map((l) => ({
              produitId: l.produitId,
              quantite: l.quantite,
              prixUnitaire: l.produit.prix,
            })),
          },
        },
        include: { lignes: true },
      });
      creees.push(nouvelle);
    }

    for (const ligne of panier.lignes) {
      await tx.produit.update({
        where: { id: ligne.produitId },
        data: { stock: { decrement: ligne.quantite } },
      });
    }

    await tx.lignePanier.deleteMany({ where: { panierId: panier.id } });

    return creees;
  });

  return NextResponse.json({
    ...commandes[0],
    commandes: commandes.map((c) => ({
      id: c.id,
      codeCommande: c.codeCommande,
      totalPaye: c.totalPaye,
    })),
  });
}

export async function GET() {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const commandes = await prisma.commande.findMany({
    where: { acheteurId: session.id },
    orderBy: { createdAt: "desc" },
    include: { lignes: { include: { produit: true } } },
  });

  return NextResponse.json(commandes);
}
