import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";
import { notifier } from "@/lib/notifications";

const TRANSITIONS_AUTORISEES: Record<string, string> = {
  CONFIRMEE: "EN_PREPARATION",
  EN_PREPARATION: "PRETE",
};

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

  if (commande.statutPaiement !== "BLOQUE_SEQUESTRE") {
    return NextResponse.json(
      { erreur: "Les fonds ne sont pas encore sécurisés pour cette commande." },
      { status: 400 }
    );
  }

  const prochainStatut = TRANSITIONS_AUTORISEES[commande.statut];
  if (!prochainStatut) {
    return NextResponse.json(
      { erreur: `Impossible de faire avancer une commande "${commande.statut}".` },
      { status: 400 }
    );
  }

  const commandeMaj = await prisma.commande.update({
    where: { id: params.id },
    data: { statut: prochainStatut as any },
  });

  if (prochainStatut === "PRETE") {
    await notifier(
      commande.acheteurId,
      "Ta commande est prête, elle va bientôt être expédiée.",
      `/commandes/${commande.id}`
    );
  }

  return NextResponse.json(commandeMaj);
}
