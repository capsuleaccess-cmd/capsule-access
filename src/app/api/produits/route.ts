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

  const { nom, description, prix, stock, categorie, photos, quantiteExpediable } =
    await req.json();
  if (!nom || prix === undefined) {
    return NextResponse.json(
      { erreur: "Nom et prix sont requis." },
      { status: 400 }
    );
  }

  const produit = await prisma.produit.create({
    data: {
      nom,
      description,
      prix: parseFloat(prix),
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
