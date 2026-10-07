import { NextResponse } from "next/server";
import { lireUtilisateurCourant } from "@/lib/auth";

export async function GET() {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }
  return NextResponse.json(session);
}
