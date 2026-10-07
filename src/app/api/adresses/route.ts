import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";

export async function GET() {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }
  const adresses = await prisma.adresse.findMany({
    where: { userId: session.id },
    orderBy: { id: "desc" },
  });
  return NextResponse.json(adresses);
}

export async function POST(req: NextRequest) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const { ville, quartier, details } = await req.json();
  if (!ville || !quartier) {
    return NextResponse.json(
      { erreur: "Ville et quartier sont requis." },
      { status: 400 }
    );
  }

  const adresse = await prisma.adresse.create({
    data: { ville, quartier, details, userId: session.id },
  });

  return NextResponse.json(adresse);
}
