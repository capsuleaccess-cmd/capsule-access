import { NextRequest, NextResponse } from "next/server";
import { lireUtilisateurCourant } from "@/lib/auth";

// MVP — l'image est convertie en data URI et stockée directement dans
// Produit.photos (String[]). Ça fonctionne pour un petit catalogue mais
// alourdit la base à mesure que le nombre de produits grandit.
//
// Pour passer à un vrai stockage cloud (Cloudinary, S3, ou un bucket
// compatible S3 comme Backblaze/Wasabi), il suffit de remplacer le corps
// de cette fonction par un upload vers le fournisseur et de retourner son
// URL publique à la place du data URI — le reste de l'app (qui stocke une
// simple chaîne dans `photos`) n'a pas besoin de changer.

const TAILLE_MAX = 2 * 1024 * 1024; // 2 Mo
const TYPES_AUTORISES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const session = lireUtilisateurCourant();
  if (!session) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const formData = await req.formData();
  const fichier = formData.get("fichier");

  if (!(fichier instanceof File)) {
    return NextResponse.json({ erreur: "Aucun fichier reçu." }, { status: 400 });
  }
  if (!TYPES_AUTORISES.includes(fichier.type)) {
    return NextResponse.json(
      { erreur: "Format non supporté (JPEG, PNG ou WebP uniquement)." },
      { status: 400 }
    );
  }
  if (fichier.size > TAILLE_MAX) {
    return NextResponse.json(
      { erreur: "Image trop lourde (2 Mo maximum)." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await fichier.arrayBuffer());
  const dataUri = `data:${fichier.type};base64,${buffer.toString("base64")}`;

  return NextResponse.json({ url: dataUri });
}
