import { prisma } from "./prisma";

const PREFIXES: Record<string, string> = {
  KISANGANI: "KIS",
  KINSHASA: "KIN",
  LUBUMBASHI: "LUB",
};

export async function genererCodeCommande(villeDestination: string, decalage = 0) {
  const total = await prisma.commande.count();
  const prefixe = PREFIXES[villeDestination] || "RDC";
  const numero = String(total + 1 + decalage).padStart(6, "0");
  return `${prefixe}-${numero}`;
}
