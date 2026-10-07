import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";
import { notifier } from "@/lib/notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const boutique = await prisma.boutique.findUnique({
    where: { proprietaireId: session.id },
  });
  if (!boutique) {
    return NextResponse.json({ erreur: "Aucune boutique." }, { status: 403 });
  }

  const { agentLivraisonId } = await req.json();
  if (!agentLivraisonId) {
    return NextResponse.json({ erreur: "agentLivraisonId requis." }, { status: 400 });
  }

  const commande = await prisma.commande.findUnique({
    where: { id: params.id },
    include: { lignes: { include: { produit: true } } },
  });
  if (!commande) {
    return NextResponse.json({ erreur: "Commande introuvable." }, { status: 404 });
  }

  const appartientALaBoutique = commande.lignes.some(
    (l) => l.produit.boutiqueId === boutique.id
  );
  if (!appartientALaBoutique) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
  }

  if (commande.statut !== "PRETE") {
    return NextResponse.json(
      { erreur: "La commande doit être prête avant expédition." },
      { status: 400 }
    );
  }

  const agent = await prisma.agentLivraison.findUnique({
    where: { id: agentLivraisonId },
  });
  if (!agent || agent.boutiqueId !== boutique.id) {
    return NextResponse.json({ erreur: "Livreur invalide." }, { status: 400 });
  }

  const commandeMaj = await prisma.commande.update({
    where: { id: params.id },
    data: { agentLivraisonId, statut: "EN_LIVRAISON" },
    include: { agentLivraison: true },
  });

  await notifier(
    commande.acheteurId,
    `Ta commande est en cours de livraison avec ${agent.nom} (${agent.telephone}).`,
    `/commandes/${commande.id}`
  );

  return NextResponse.json(commandeMaj);
}
