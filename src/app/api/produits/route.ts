import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const boutique = await prisma.boutique.findUnique({
    where: { proprietaireId: session.id },
  });
  if (!boutique) {
    return NextResponse.json(
      { erreur: "Créez d'abord votre boutique." },
      { status: 400 }
    );
  }

  const { nom, description, prix, stock, categorie, photos, quantiteExpediable, fraisTransport, fraisExpedition } =
    await req.json();
  if (!nom || prix === undefined) {
    return NextResponse.json(
      { erreur: "Nom et prix sont requis." },
      { status: 400 }
    );
  }

  if (fraisTransport === undefined || fraisTransport === null) {
    return NextResponse.json(
      { erreur: "Choisis la livraison gratuite ou la livraison payante." },
      { status: 400 }
    );
  }
  if (
    typeof fraisTransport !== "number" ||
    !Number.isFinite(fraisTransport) ||
    fraisTransport < 0 ||
    fraisTransport > 10000000
  ) {
    return NextResponse.json(
      { erreur: "Le montant des frais de transport est invalide." },
      { status: 400 }
    );
  }
  const quantiteExp = quantiteExpediable ? parseInt(quantiteExpediable) : 0;
  let fraisExpeditionFinal: number | null = null;
  if (quantiteExp > 0) {
    if (fraisExpedition === undefined || fraisExpedition === null) {
      return NextResponse.json(
        { erreur: "Fixe les frais d'exp\u00e9dition vers les autres villes." },
        { status: 400 }
      );
    }
    if (
      typeof fraisExpedition !== "number" ||
      !Number.isFinite(fraisExpedition) ||
      fraisExpedition < 0 ||
      fraisExpedition > 10000000
    ) {
      return NextResponse.json(
        { erreur: "Le montant des frais d'exp\u00e9dition est invalide." },
        { status: 400 }
      );
    }
    fraisExpeditionFinal = fraisExpedition;
  }
  const produit = await prisma.produit.create({
    data: {
      nom,
      description,
      prix: parseFloat(prix),
      fraisTransport,
      fraisExpedition: fraisExpeditionFinal,
      stock: stock ? parseInt(stock) : 0,
      categorie,
      photos: photos && Array.isArray(photos) ? photos : [],
      villeOrigine: boutique.ville,
      quantiteExpediable: quantiteExpediable ? parseInt(quantiteExpediable) : 0,
      boutiqueId: boutique.id,
    },
  });

  return NextResponse.json(produit);
}

export async function GET() {
  const produits = await prisma.produit.findMany({
    orderBy: { createdAt: "desc" },
    include: { boutique: true },
    take: 24,
  });
  return NextResponse.json(produits);
}
