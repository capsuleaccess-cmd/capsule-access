import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerAdmin } from "@/lib/auth";

export async function GET() {
  if (!exigerAdmin()) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 403 });
  }

  const utilisateurs = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nom: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json(utilisateurs);
}
