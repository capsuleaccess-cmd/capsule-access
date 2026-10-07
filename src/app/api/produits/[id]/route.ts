import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const produit = await prisma.produit.findUnique({
    where: { id: params.id },
    include: { boutique: true },
  });

  if (!produit) {
    return NextResponse.json({ erreur: "Produit introuvable." }, { status: 404 });
  }

  return NextResponse.json(produit);
}
