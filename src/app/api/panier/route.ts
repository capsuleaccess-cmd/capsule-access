import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";

async function panierDe(userId: string) {
  return prisma.panier.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function GET() {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const panier = await prisma.panier.findUnique({
    where: { userId: session.id },
    include: { lignes: { include: { produit: true } } },
  });

  const lignes = panier?.lignes ?? [];
  const total = lignes.reduce((s, l) => s + l.produit.prix * l.quantite, 0);

  return NextResponse.json({ lignes, total });
}

export async function POST(req: NextRequest) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const { produitId, quantite } = await req.json();
  if (!produitId) {
    return NextResponse.json({ erreur: "produitId requis." }, { status: 400 });
  }

  const produit = await prisma.produit.findUnique({ where: { id: produitId } });
  if (!produit) {
    return NextResponse.json({ erreur: "Produit introuvable." }, { status: 404 });
  }

  const panier = await panierDe(session.id);

  const ligne = await prisma.lignePanier.upsert({
    where: { panierId_produitId: { panierId: panier.id, produitId } },
    update: { quantite: { increment: quantite ?? 1 } },
    create: { panierId: panier.id, produitId, quantite: quantite ?? 1 },
  });

  return NextResponse.json(ligne);
}
