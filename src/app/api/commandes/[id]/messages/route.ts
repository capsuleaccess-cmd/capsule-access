import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";
import { notifierPlusieurs } from "@/lib/notifications";

async function verifierAcces(userId: string, commandeId: string) {
  const commande = await prisma.commande.findUnique({
    where: { id: commandeId },
    include: { lignes: { include: { produit: { include: { boutique: true } } } } },
  });
  if (!commande) return null;

  const vendeurIds = commande.lignes.map((l) => l.produit.boutique.proprietaireId);
  const estAcheteur = commande.acheteurId === userId;
  const estVendeur = vendeurIds.includes(userId);

  if (!estAcheteur && !estVendeur) return null;
  return { commande, vendeurIds };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const acces = await verifierAcces(session.id, params.id);
  if (!acces) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
  }

  const messages = await prisma.messageExpedition.findMany({
    where: { commandeId: params.id },
    include: { expediteur: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const { contenu } = await req.json();
  if (!contenu?.trim()) {
    return NextResponse.json({ erreur: "Message vide." }, { status: 400 });
  }

  const acces = await verifierAcces(session.id, params.id);
  if (!acces) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
  }

  const message = await prisma.messageExpedition.create({
    data: { commandeId: params.id, expediteurId: session.id, contenu: contenu.trim() },
    include: { expediteur: true },
  });

  const destinataires =
    session.id === acces.commande.acheteurId
      ? acces.vendeurIds
      : [acces.commande.acheteurId];

  await notifierPlusieurs(
    destinataires,
    `Nouveau message sur la commande ${acces.commande.codeCommande}`,
    `/commandes/${params.id}`
  );

  return NextResponse.json(message);
}
