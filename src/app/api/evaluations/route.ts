import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const { commandeId, note, commentaire } = await req.json();

  if (!commandeId || !note || note < 1 || note > 5) {
    return NextResponse.json(
      { erreur: "Note (1 à 5) et commandeId sont requis." },
      { status: 400 }
    );
  }

  const commande = await prisma.commande.findUnique({
    where: { id: commandeId },
    include: { evaluation: true },
  });

  if (!commande || commande.acheteurId !== session.id) {
    return NextResponse.json({ erreur: "Commande introuvable." }, { status: 404 });
  }
  if (commande.statut !== "LIVREE" && commande.statut !== "TERMINEE") {
    return NextResponse.json(
      { erreur: "La commande doit être livrée avant évaluation." },
      { status: 400 }
    );
  }
  if (commande.evaluation) {
    return NextResponse.json(
      { erreur: "Cette commande a déjà été évaluée." },
      { status: 409 }
    );
  }

  const [evaluation] = await prisma.$transaction([
    prisma.evaluation.create({
      data: { commandeId, auteurId: session.id, note, commentaire },
    }),
    prisma.commande.update({
      where: { id: commandeId },
      data: { statut: "TERMINEE" },
    }),
  ]);

  return NextResponse.json(evaluation);
}
