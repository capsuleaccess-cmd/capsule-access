import Header from "@/components/Header";
import ImageProduit from "@/components/ImageProduit";
import { prisma } from "@/lib/prisma";
import { VILLES } from "@/lib/config";

const categories = [
  "Électronique",
  "Mode",
  "Maison",
  "Alimentation",
  "Beauté",
  "Sport",
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: { ville?: string };
}) {
  const villeFiltre = searchParams.ville;

  const produits = await prisma.produit.findMany({
    where: villeFiltre ? { villeOrigine: villeFiltre as any } : undefined,
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <>
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-8 rounded-2xl bg-primary px-6 py-10 text-white">
          <h1 className="text-2xl font-bold md:text-3xl">
            La marketplace multi-villes de la RDC
          </h1>
          <p className="mt-2 max-w-xl text-white/90">
            Achetez et vendez entre Kisangani, Kinshasa et Lubumbashi. Vendeurs
            vérifiés, paiement sécurisé par séquestre, livraison suivie.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">Ville</h2>
          <div className="flex flex-wrap gap-2">
            <a
              href="/"
              className={`rounded-full border px-4 py-2 text-sm ${
                !villeFiltre ? "border-primary bg-primary/10 text-primary" : "bg-white"
              }`}
            >
              Toutes les villes
            </a>
            {VILLES.map((v) => (
              <a
                key={v.valeur}
                href={`/?ville=${v.valeur}`}
                className={`rounded-full border px-4 py-2 text-sm ${
                  villeFiltre === v.valeur
                    ? "border-primary bg-primary/10 text-primary"
                    : "bg-white"
                }`}
              >
                {v.label}
              </a>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold">Catégories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <a
                key={cat}
                href={`/recherche?q=${encodeURIComponent(cat)}`}
                className="rounded-full border bg-white px-4 py-2 text-sm hover:border-primary hover:text-primary"
              >
                {cat}
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Produits populaires</h2>

          {produits.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun produit pour le moment. Sois le premier vendeur à en ajouter !
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {produits.map((produit) => (
                <a
                  key={produit.id}
                  href={`/produits/${produit.id}`}
                  className="rounded-xl border bg-white p-3 hover:border-primary"
                >
                  <ImageProduit
                    src={produit.photos[0]}
                    alt={produit.nom}
                    className="mb-2 aspect-square w-full rounded-lg"
                  />
                  <p className="truncate text-sm font-medium">{produit.nom}</p>
                  <p className="text-sm font-semibold text-primary">
                    {produit.prix.toFixed(0)} FC
                  </p>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
