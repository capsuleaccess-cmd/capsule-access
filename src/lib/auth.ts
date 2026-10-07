import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

function obtenirJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET n'est pas configuré.");
  }

  return JWT_SECRET;
}

const COOKIE_NAME = "capsule_session";

export async function hashMotDePasse(motDePasse: string) {
  return bcrypt.hash(motDePasse, 10);
}

export async function verifierMotDePasse(motDePasse: string, hash: string) {
  return bcrypt.compare(motDePasse, hash);
}

export function creerToken(payload: { id: string; role: string }) {
  return jwt.sign(payload, obtenirJwtSecret(), { expiresIn: "7d" });
}

export function lireToken(token: string) {
  try {
    return jwt.verify(token, obtenirJwtSecret()) as {
      id: string;
      role: string;
    };
  } catch {
    return null;
  }
}

export function definirCookieSession(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function supprimerCookieSession() {
  cookies().delete(COOKIE_NAME);
}

export function lireUtilisateurCourant() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return lireToken(token);
}

export function exigerAdmin() {
  const session = lireUtilisateurCourant();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function lireUtilisateurCompletCourant() {
  const session = lireUtilisateurCourant();
  if (!session) return null;

  const { prisma } = await import("./prisma");

  return prisma.user.findUnique({
    where: { id: session.id },
  });
}