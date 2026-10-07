import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import BoutonAjouterPanier from "@/components/BoutonAjouterPanier";
import GalerieProduit from "@/components/GalerieProduit";

const libellesVille: Record<string, string> = {
  KISANGANI: "Kisangani",
  KINSHASA: "Kinshasa",
  LUBUMBASHI: "Lubumbashi",
};

export default async function ProduitPage({
  params,
}: {
  params: { id: string };
}) {
  const produit = await prisma.produit.findUnique({
    where: { id: params.id },
    include: { boutique: true },
  });

  if (!produit) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <GalerieProduit photos={produit.photos} nom={produit.nom} />

          <div>
            <h1 className="text-2xl font-bold">{produit.nom}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Vendu par {produit.boutique.nom} — {libellesVille[produit.boutique.ville]}
            </p>

            <p className="mt-4 text-3xl font-bold text-primary">
              {produit.prix.toFixed(0)} FC
            </p>

            <p className="mt-2 text-sm text-gray-600">
              {produit.stock > 0
                ? `${produit.stock} en stock à ${libellesVille[produit.villeOrigine]}`
                : "Rupture de stock"}
            </p>

            {produit.quantiteExpediable > 0 && (
              <p className="mt-1 text-xs text-primary">
                📦 Expédiable vers d'autres villes (jusqu'à {produit.quantiteExpediable}{" "}
                unité{produit.quantiteExpediable > 1 ? "s" : ""} — modalités à convenir
                avec le vendeur après commande)
              </p>
            )}

            {produit.description && (
              <p className="mt-4 text-gray-700">{produit.description}</p>
            )}

            <BoutonAjouterPanier produitId={produit.id} enStock={produit.stock > 0} />
          </div>
        </div>
      </main>
    </>
  );
}
