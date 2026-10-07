import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAdmin } from "@/lib/auth";
import { notifier, notifierPlusieurs } from "@/lib/notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!exigerAdmin()) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
  }

  const { approuve } = await req.json();

  const commande = await prisma.commande.findUnique({
    where: { id: params.id },
    include: { lignes: { include: { produit: { include: { boutique: true } } } } },
  });
  if (!commande) {
    return NextResponse.json({ erreur: "Commande introuvable." }, { status: 404 });
  }
  if (commande.statutPaiement !== "EN_ATTENTE_VERIFICATION") {
    return NextResponse.json(
      { erreur: "Cette commande n'est pas en attente de vérification." },
      { status: 409 }
    );
  }

  const vendeurIds = commande.lignes.map((l) => l.produit.boutique.proprietaireId);

  if (approuve) {
    const commandeMaj = await prisma.commande.update({
      where: { id: params.id },
      data: { statutPaiement: "BLOQUE_SEQUESTRE", statut: "CONFIRMEE" },
    });

    await Promise.all([
      notifier(
        commande.acheteurId,
        `Paiement confirmé pour ${commande.codeCommande}, ta commande est en préparation.`,
        `/commandes/${commande.id}`
      ),
      notifierPlusieurs(
        vendeurIds,
        `Fonds sécurisés pour ${commande.codeCommande} — tu peux préparer la commande.`,
        "/vendeur/commandes"
      ),
    ]);

    return NextResponse.json(commandeMaj);
  }

  const commandeMaj = await prisma.commande.update({
    where: { id: params.id },
    data: { statutPaiement: "EN_ATTENTE_PREUVE", preuvePaiementUrl: null },
  });

  await notifier(
    commande.acheteurId,
    `Ta preuve de paiement pour ${commande.codeCommande} n'a pas pu être validée. Merci de la renvoyer.`,
    `/commandes/${commande.id}/payer`
  );

  return NextResponse.json(commandeMaj);
}
