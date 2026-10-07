import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";

export async function POST() {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: { userId: session.id, lu: false },
    data: { lu: true },
  });

  return NextResponse.json({ ok: true });
}
