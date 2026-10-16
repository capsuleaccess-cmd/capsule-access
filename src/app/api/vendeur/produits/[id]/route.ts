import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";

const MAX_PHOTOS = 3;

// Vérifie la session du vendeur, retrouve sa boutique, puis le produit
// demandé — à condition qu'il appartienne bien à cette boutique.
// Un vendeur ne peut donc jamais lire, modifier ou supprimer le produit
// d'une autre boutique : dans ce cas on répond « introuvable » (404)
// plutôt que de révéler son existence.
async function resoudreProduitDuVendeur(id: string) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return {
      erreur: NextResponse.json({ erreur: "Non connecté." }, { status: 401 }),
    };
  }

  const boutique = await prisma.boutique.findUnique({
    where: { proprietaireId: session.id },
  });
  if (!boutique) {
    return {
      erreur: NextResponse.json(
        { erreur: "Aucune boutique trouvée." },
        { status: 404 }
      ),
    };
  }

  const produit = await prisma.produit.findUnique({ where: { id } });
  if (!produit || produit.boutiqueId !== boutique.id) {
    return {
      erreur: NextResponse.json(
        { erreur: "Produit introuvable." },
        { status: 404 }
      ),
    };
  }

  return { boutique, produit };
}

function messageErreur(message: string) {
  return NextResponse.json({ erreur: message }, { status: 400 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const contexte = await resoudreProduitDuVendeur(params.id);
  if ("erreur" in contexte) return contexte.erreur;

  const corps = await req.json().catch(() => null);
  if (!corps || typeof corps !== "object") {
    return messageErreur("Données invalides.");
  }

  const donnees: {
    nom?: string;
    description?: string | null;
    prix?: number;
    stock?: number;
    categorie?: string | null;
    photos?: string[];
    quantiteExpediable?: number;
  } = {};

  if (corps.nom !== undefined) {
    const nom = String(corps.nom).trim();
    if (!nom) return messageErreur("Le nom du produit est requis.");
    if (nom.length > 120) {
      return messageErreur("Le nom du produit ne peut pas dépasser 120 caractères.");
    }
    donnees.nom = nom;
  }

  if (corps.description !== undefined) {
    const description =
      corps.description === null ? "" : String(corps.description).trim();
    if (description.length > 2000) {
      return messageErreur("La description ne peut pas dépasser 2000 caractères.");
    }
    donnees.description = description === "" ? null : description;
  }

  if (corps.prix !== undefined) {
    const prix =
      typeof corps.prix === "number"
        ? corps.prix
        : parseFloat(String(corps.prix).replace(",", "."));
    if (!Number.isFinite(prix) || prix < 0) {
      return messageErreur("Le prix doit être un nombre positif ou nul.");
    }
    donnees.prix = prix;
  }

  if (corps.stock !== undefined) {
    const stock =
      typeof corps.stock === "number"
        ? Math.trunc(corps.stock)
        : parseInt(String(corps.stock), 10);
    if (!Number.isFinite(stock) || stock < 0) {
      return messageErreur("Le stock doit être un entier positif ou nul.");
    }
    donnees.stock = stock;
  }

  if (corps.quantiteExpediable !== undefined) {
    const quantite =
      typeof corps.quantiteExpediable === "number"
        ? Math.trunc(corps.quantiteExpediable)
        : parseInt(String(corps.quantiteExpediable), 10);
    if (!Number.isFinite(quantite) || quantite < 0) {
      return messageErreur(
        "La quantité expédiable doit être un entier positif ou nul."
      );
    }
    donnees.quantiteExpediable = quantite;
  }

  if (corps.categorie !== undefined) {
    const categorie =
      corps.categorie === null ? "" : String(corps.categorie).trim();
    if (categorie.length > 60) {
      return messageErreur("La catégorie ne peut pas dépasser 60 caractères.");
    }
    donnees.categorie = categorie === "" ? null : categorie;
  }

  if (corps.photos !== undefined) {
    if (!Array.isArray(corps.photos)) {
      return messageErreur("Le format des photos est invalide.");
    }
    const photos = corps.photos.filter(
      (photo: unknown): photo is string =>
        typeof photo === "string" && photo.trim() !== ""
    );
    if (photos.length > MAX_PHOTOS) {
      return messageErreur(`Maximum ${MAX_PHOTOS} photos par produit.`);
    }
    donnees.photos = photos;
  }

  // La ville d'origine du produit suit celle de la boutique : elle n'est
  // volontairement pas modifiable depuis ce formulaire.
  if (Object.keys(donnees).length === 0) {
    return messageErreur("Aucune modification fournie.");
  }

  const produitMaj = await prisma.produit.update({
    where: { id: contexte.produit.id },
    data: donnees,
  });

  return NextResponse.json(produitMaj);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const contexte = await resoudreProduitDuVendeur(params.id);
  if ("erreur" in contexte) return contexte.erreur;

  const produit = contexte.produit;

  const dejaCommande = await prisma.ligneCommande.count({
    where: { produitId: produit.id },
  });
  if (dejaCommande > 0) {
    return NextResponse.json(
      { erreur: "Ce produit a déjà été commandé, il ne peut pas être supprimé." },
      { status: 409 }
    );
  }

  await prisma.$transaction([
    prisma.lignePanier.deleteMany({ where: { produitId: produit.id } }),
    prisma.produit.delete({ where: { id: produit.id } }),
  ]);

  return NextResponse.json({ ok: true });
}
