import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";

async function verifierProprietaire(userId: string, livreurId: string) {
  const boutique = await prisma.boutique.findUnique({
    where: { proprietaireId: userId },
  });
  if (!boutique) return null;

  const livreur = await prisma.agentLivraison.findUnique({
    where: { id: livreurId },
  });
  if (!livreur || livreur.boutiqueId !== boutique.id) return null;

  return livreur;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const livreur = await verifierProprietaire(session.id, params.id);
  if (!livreur) {
    return NextResponse.json({ erreur: "Livreur introuvable." }, { status: 404 });
  }

  const { nom, telephone, photoUrl } = await req.json();

  const livreurMaj = await prisma.agentLivraison.update({
    where: { id: params.id },
    data: {
      nom: nom ?? undefined,
      telephone: telephone ?? undefined,
      photoUrl: photoUrl ?? undefined,
    },
  });

  return NextResponse.json(livreurMaj);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const livreur = await verifierProprietaire(session.id, params.id);
  if (!livreur) {
    return NextResponse.json({ erreur: "Livreur introuvable." }, { status: 404 });
  }

  // Les commandes déjà expédiées via ce livreur gardent leur référence
  // historique (agentLivraisonId passe à null) — on ne bloque pas la
  // suppression pour autant, c'est une donnée de flotte, pas une commande.
  await prisma.commande.updateMany({
    where: { agentLivraisonId: params.id },
    data: { agentLivraisonId: null },
  });

  await prisma.agentLivraison.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
