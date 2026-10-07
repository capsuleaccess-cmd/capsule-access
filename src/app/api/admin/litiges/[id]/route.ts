import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAdmin } from "@/lib/auth";
import { notifier } from "@/lib/notifications";

// Mappe la décision admin vers le statut final du litige ET de la commande.
const RESOLUTIONS: Record<
  string,
  { statutLitige: string; statutCommande: string }
> = {
  REMBOURSEMENT: { statutLitige: "RESOLU_REMBOURSEMENT", statutCommande: "ANNULEE" },
  REMPLACEMENT: { statutLitige: "RESOLU_REMPLACEMENT", statutCommande: "EN_PREPARATION" },
  AUTRE: { statutLitige: "RESOLU_AUTRE", statutCommande: "TERMINEE" },
  REJET: { statutLitige: "REJETE", statutCommande: "TERMINEE" },
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!exigerAdmin()) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
  }

  const { resolution, decision } = await req.json();
  const mapping = RESOLUTIONS[resolution];
  if (!mapping) {
    return NextResponse.json({ erreur: "Résolution invalide." }, { status: 400 });
  }

  const litige = await prisma.litige.findUnique({ where: { id: params.id } });
  if (!litige) {
    return NextResponse.json({ erreur: "Litige introuvable." }, { status: 404 });
  }

  const [litigeMaj] = await prisma.$transaction([
    prisma.litige.update({
      where: { id: params.id },
      data: { statut: mapping.statutLitige as any, decision },
    }),
    prisma.commande.update({
      where: { id: litige.commandeId },
      data: { statut: mapping.statutCommande as any },
    }),
  ]);

  await notifier(
    litige.auteurId,
    `Ton litige a été traité : ${decision || mapping.statutLitige}`,
    `/commandes/${litige.commandeId}`
  );

  return NextResponse.json(litigeMaj);
}
