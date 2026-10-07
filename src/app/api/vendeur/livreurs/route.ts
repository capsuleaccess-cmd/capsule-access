import { NextRequest, NextResponse } from "next/server";
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

  const livreurs = await prisma.agentLivraison.findMany({
    where: { boutiqueId: boutique.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(livreurs);
}

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

  const { nom, telephone, photoUrl } = await req.json();
  if (!nom || !telephone) {
    return NextResponse.json(
      { erreur: "Nom et téléphone sont requis." },
      { status: 400 }
    );
  }

  const livreur = await prisma.agentLivraison.create({
    data: { nom, telephone, photoUrl, boutiqueId: boutique.id },
  });

  return NextResponse.json(livreur, { status: 201 });
}
