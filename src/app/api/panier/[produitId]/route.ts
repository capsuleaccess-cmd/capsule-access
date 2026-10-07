import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { produitId: string } }
) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const { quantite } = await req.json();
  const panier = await prisma.panier.findUnique({ where: { userId: session.id } });
  if (!panier) {
    return NextResponse.json({ erreur: "Panier introuvable." }, { status: 404 });
  }

  if (quantite <= 0) {
    await prisma.lignePanier.delete({
      where: { panierId_produitId: { panierId: panier.id, produitId: params.produitId } },
    });
    return NextResponse.json({ ok: true });
  }

  const ligne = await prisma.lignePanier.update({
    where: { panierId_produitId: { panierId: panier.id, produitId: params.produitId } },
    data: { quantite },
  });

  return NextResponse.json(ligne);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { produitId: string } }
) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const panier = await prisma.panier.findUnique({ where: { userId: session.id } });
  if (!panier) {
    return NextResponse.json({ erreur: "Panier introuvable." }, { status: 404 });
  }

  await prisma.lignePanier.delete({
    where: { panierId_produitId: { panierId: panier.id, produitId: params.produitId } },
  });

  return NextResponse.json({ ok: true });
}
