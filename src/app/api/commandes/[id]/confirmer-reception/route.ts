import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";
import { notifierPlusieurs } from "@/lib/notifications";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const commande = await prisma.commande.findUnique({
    where: { id: params.id },
    include: {
      lignes: { include: { produit: { include: { boutique: true } } } },
    },
  });

  if (!commande || commande.acheteurId !== session.id) {
    return NextResponse.json({ erreur: "Commande introuvable." }, { status: 404 });
  }
  if (commande.statut !== "EN_LIVRAISON") {
    return NextResponse.json(
      { erreur: "Cette commande n'est pas encore en livraison." },
      { status: 400 }
    );
  }

  const commandeMaj = await prisma.commande.update({
    where: { id: params.id },
    data: { statutPaiement: "LIBERE_VENDEUR", statut: "LIVREE" },
  });

  const vendeurs = commande.lignes.reduce((acc, l) => {
    acc.set(l.produit.boutique.proprietaireId, l.produit.boutique);
    return acc;
  }, new Map<string, { modeRetraitPaiement: string | null; numeroRetraitPaiement: string | null }>());

  await Promise.all(
    Array.from(vendeurs.entries()).map(([vendeurId, boutique]) =>
      notifierPlusieurs(
        [vendeurId],
        boutique.modeRetraitPaiement && boutique.numeroRetraitPaiement
          ? `Fonds libérés pour ${commande.codeCommande} ! Disponibles sur ${boutique.modeRetraitPaiement} (${boutique.numeroRetraitPaiement}).`
          : `Fonds libérés pour ${commande.codeCommande} ! Renseigne ton numéro de retrait dans ta boutique.`,
        "/vendeur/dashboard"
      )
    )
  );

  return NextResponse.json(commandeMaj);
}
