import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";
import { notifierPlusieurs } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const { commandeId, motif, description } = await req.json();
  if (!commandeId || !motif) {
    return NextResponse.json(
      { erreur: "commandeId et motif sont requis." },
      { status: 400 }
    );
  }

  const commande = await prisma.commande.findUnique({
    where: { id: commandeId },
    include: { litige: true },
  });

  if (!commande || commande.acheteurId !== session.id) {
    return NextResponse.json({ erreur: "Commande introuvable." }, { status: 404 });
  }
  if (commande.litige) {
    return NextResponse.json(
      { erreur: "Un litige existe déjà pour cette commande." },
      { status: 409 }
    );
  }
  if (commande.statut === "ANNULEE") {
    return NextResponse.json(
      { erreur: "Impossible d'ouvrir un litige sur une commande annulée." },
      { status: 400 }
    );
  }

  const [litige] = await prisma.$transaction([
    prisma.litige.create({
      data: { commandeId, auteurId: session.id, motif, description },
    }),
    prisma.commande.update({
      where: { id: commandeId },
      data: { statut: "LITIGE" },
    }),
  ]);

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  await notifierPlusieurs(
    admins.map((a) => a.id),
    `Nouveau litige : ${motif}`,
    "/admin/litiges"
  );

  return NextResponse.json(litige);
}

// Réservé à l'administration.
export async function GET() {
  const { exigerAdmin } = await import("@/lib/auth");
  if (!exigerAdmin()) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
  }

  const litiges = await prisma.litige.findMany({
    orderBy: { createdAt: "desc" },
    include: { commande: true, auteur: true },
  });

  return NextResponse.json(litiges);
}
