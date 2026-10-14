"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";

type Produit = {
  id: string;
  nom: string;
  description: string | null;
  prix: number;
  stock: number;
  categorie: string | null;
  photos: string[];
  createdAt: string;
};

export default function ProduitsVendeurPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function chargerProduits() {
      try {
        const res = await fetch("/api/vendeur/produits");
        const data = await res.json();

        if (!res.ok) {
          setErreur(data.erreur || "Impossible de charger les produits.");
          return;
        }

        setProduits(data);
      } catch {
        setErreur("Impossible de contacter le serveur. Réessaie.");
      } finally {
        setChargement(false);
      }
    }

    chargerProduits();
  }, []);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Mes produits</h1>
            <p className="mt-1 text-sm text-gray-500">
              Consulte les produits enregistrés dans ta boutique.
            </p>
          </div>
          <a
            href="/vendeur/produits/nouveau"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            + Ajouter un produit
          </a>
        </div>

        <div className="mb-5">
          <a href="/vendeur/dashboard" className="text-sm text-primary hover:underline">
            ← Retour au tableau de bord
          </a>
        </div>

        {chargement && <p className="text-sm text-gray-500">Chargement des produits...</p>}

        {!chargement && erreur && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{erreur}</p>
            {erreur.toLowerCase().includes("connect") && (
              <a href="/connexion" className="mt-2 inline-block underline">
                Se connecter
              </a>
            )}
          </div>
        )}

        {!chargement && !erreur && produits.length === 0 && (
          <div className="rounded-xl border bg-white p-6 text-center">
            <p className="mb-4 text-gray-600">Tu n’as pas encore ajouté de produit.</p>
            <a
              href="/vendeur/produits/nouveau"
              className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Ajouter mon premier produit
            </a>
          </div>
        )}

        {!chargement && !erreur && produits.length > 0 && (
          <div className="space-y-3">
            {produits.map((produit) => (
              <article key={produit.id} className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row">
                {produit.photos && produit.photos.length > 0 ? (
                  <img
                    src={produit.photos[0]}
                    alt={produit.nom}
                    className="h-28 w-28 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-center text-xs text-gray-500">
                    Aucune photo
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold">{produit.nom}</h2>
                    <p className="font-bold text-primary">
                      {Number(produit.prix).toLocaleString("fr-FR")} FC
                    </p>
                  </div>
                  {produit.categorie && (
                    <p className="mt-1 text-sm text-gray-500">Catégorie : {produit.categorie}</p>
                  )}
                  {produit.description && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{produit.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span className={produit.stock > 0 ? "text-gray-600" : "font-medium text-amber-700"}>
                      Stock : {produit.stock}
                    </span>
                    <span className="text-gray-500">
                      Photos : {produit.photos?.length ?? 0}/3
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
