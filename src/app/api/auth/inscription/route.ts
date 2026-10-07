import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashMotDePasse, creerToken, definirCookieSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { nom, email, motDePasse, role } = await req.json();

  if (!nom || !email || !motDePasse) {
    return NextResponse.json(
      { erreur: "Nom, email et mot de passe sont requis." },
      { status: 400 }
    );
  }

  const existant = await prisma.user.findUnique({ where: { email } });
  if (existant) {
    return NextResponse.json(
      { erreur: "Un compte existe déjà avec cet email." },
      { status: 409 }
    );
  }

  const motDePasseHash = await hashMotDePasse(motDePasse);

  const utilisateur = await prisma.user.create({
    data: {
      nom,
      email,
      motDePasseHash,
      role: role === "VENDEUR" ? "VENDEUR" : "ACHETEUR",
    },
  });

  const token = creerToken({ id: utilisateur.id, role: utilisateur.role });
  definirCookieSession(token);

  return NextResponse.json({
    id: utilisateur.id,
    nom: utilisateur.nom,
    email: utilisateur.email,
    role: utilisateur.role,
  });
}
