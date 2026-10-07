import Header from "@/components/Header";
import ImageProduit from "@/components/ImageProduit";
import { prisma } from "@/lib/prisma";

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() || "";

  const produits = q
    ? await prisma.produit.findMany({
        where: {
          OR: [
            { nom: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { categorie: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 24,
      })
    : [];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-1 text-xl font-bold">
          Résultats pour « {q} »
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          {produits.length} produit{produits.length !== 1 ? "s" : ""} trouvé
          {produits.length !== 1 ? "s" : ""}
        </p>

        {produits.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucun produit ne correspond à ta recherche.
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
      </main>
    </>
  );
}
