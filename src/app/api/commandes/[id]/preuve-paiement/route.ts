import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";
import { notifier, notifierPlusieurs } from "@/lib/notifications";

const METHODES_MOBILE_MONEY = ["M_PESA", "ORANGE_MONEY", "AIRTEL_MONEY"];

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const { methodePaiement, preuvePaiementUrl } = await req.json();

  if (!methodePaiement) {
    return NextResponse.json({ erreur: "Méthode de paiement requise." }, { status: 400 });
  }

  const commande = await prisma.commande.findUnique({
    where: { id: params.id },
    include: { lignes: { include: { produit: { include: { boutique: true } } } } },
  });

  if (!commande || commande.acheteurId !== session.id) {
    return NextResponse.json({ erreur: "Commande introuvable." }, { status: 404 });
  }
  if (commande.statutPaiement !== "EN_ATTENTE_PREUVE") {
    return NextResponse.json(
      { erreur: "Le paiement de cette commande a déjà été traité." },
      { status: 409 }
    );
  }

  const vendeurIds = commande.lignes.map((l) => l.produit.boutique.proprietaireId);

  if (methodePaiement === "ESPECES_LIVRAISON") {
    // Pas de séquestre : le client paiera en espèces à la réception.
    const commandeMaj = await prisma.commande.update({
      where: { id: params.id },
      data: {
        methodePaiement,
        statutPaiement: "BLOQUE_SEQUESTRE",
        statut: "CONFIRMEE",
      },
    });

    await notifierPlusieurs(
      vendeurIds,
      `Nouvelle commande confirmée (paiement espèces à la livraison) — ${commande.codeCommande}`,
      "/vendeur/commandes"
    );

    return NextResponse.json(commandeMaj);
  }

  if (!METHODES_MOBILE_MONEY.includes(methodePaiement)) {
    return NextResponse.json({ erreur: "Méthode invalide." }, { status: 400 });
  }
  if (!preuvePaiementUrl) {
    return NextResponse.json(
      { erreur: "La capture d'écran de la transaction est requise." },
      { status: 400 }
    );
  }

  const commandeMaj = await prisma.commande.update({
    where: { id: params.id },
    data: {
      methodePaiement,
      preuvePaiementUrl,
      statutPaiement: "EN_ATTENTE_VERIFICATION",
    },
  });

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  await notifierPlusieurs(
    admins.map((a) => a.id),
    `Preuve de paiement à vérifier — commande ${commande.codeCommande}`,
    "/admin/paiements"
  );

  return NextResponse.json(commandeMaj);
}
