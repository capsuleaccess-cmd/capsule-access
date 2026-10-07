import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }
  if (session.role !== "VENDEUR") {
    return NextResponse.json(
      { erreur: "Seuls les vendeurs peuvent créer une boutique." },
      { status: 403 }
    );
  }

  const { nom, description, ville } = await req.json();
  if (!nom) {
    return NextResponse.json({ erreur: "Le nom est requis." }, { status: 400 });
  }

  const existante = await prisma.boutique.findUnique({
    where: { proprietaireId: session.id },
  });
  if (existante) {
    return NextResponse.json(
      { erreur: "Vous avez déjà une boutique." },
      { status: 409 }
    );
  }

  const boutique = await prisma.boutique.create({
    data: { nom, description, ville: ville || "KISANGANI", proprietaireId: session.id },
  });

  return NextResponse.json(boutique);
}

export async function PATCH(req: NextRequest) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const boutique = await prisma.boutique.findUnique({
    where: { proprietaireId: session.id },
  });
  if (!boutique) {
    return NextResponse.json({ erreur: "Aucune boutique." }, { status: 404 });
  }

  const { modeRetraitPaiement, numeroRetraitPaiement, nomTitulaireCompte } =
    await req.json();

  const boutiqueMaj = await prisma.boutique.update({
    where: { id: boutique.id },
    data: { modeRetraitPaiement, numeroRetraitPaiement, nomTitulaireCompte },
  });

  return NextResponse.json(boutiqueMaj);
}

export async function GET() {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }
  const boutique = await prisma.boutique.findUnique({
    where: { proprietaireId: session.id },
    include: { produits: true },
  });
  return NextResponse.json(boutique);
}
