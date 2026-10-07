import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const notif = await prisma.notification.findUnique({ where: { id: params.id } });
  if (!notif || notif.userId !== session.id) {
    return NextResponse.json({ erreur: "Introuvable." }, { status: 404 });
  }

  await prisma.notification.update({
    where: { id: params.id },
    data: { lu: true },
  });

  return NextResponse.json({ ok: true });
}
