import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifierMotDePasse, creerToken, definirCookieSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, motDePasse } = await req.json();

  if (!email || !motDePasse) {
    return NextResponse.json(
      { erreur: "Email et mot de passe sont requis." },
      { status: 400 }
    );
  }

  const utilisateur = await prisma.user.findUnique({ where: { email } });
  if (!utilisateur) {
    return NextResponse.json(
      { erreur: "Email ou mot de passe incorrect." },
      { status: 401 }
    );
  }

  const motDePasseValide = await verifierMotDePasse(
    motDePasse,
    utilisateur.motDePasseHash
  );
  if (!motDePasseValide) {
    return NextResponse.json(
      { erreur: "Email ou mot de passe incorrect." },
      { status: 401 }
    );
  }

  const token = creerToken({ id: utilisateur.id, role: utilisateur.role });
  definirCookieSession(token);

  return NextResponse.json({
    id: utilisateur.id,
    nom: utilisateur.nom,
    email: utilisateur.email,
    role: utilisateur.role,
  });
}
