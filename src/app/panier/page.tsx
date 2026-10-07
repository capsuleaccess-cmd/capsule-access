"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";

type LignePanier = {
  produitId: string;
  quantite: number;
  produit: { id: string; nom: string; prix: number; stock: number };
};

export default function PanierPage() {
  const [lignes, setLignes] = useState<LignePanier[]>([]);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);

  async function charger() {
    setChargement(true);
    const res = await fetch("/api/panier");
    if (res.ok) {
      const data = await res.json();
      setLignes(data.lignes);
      setTotal(data.total);
    }
    setChargement(false);
  }

  useEffect(() => {
    charger();
  }, []);

  async function modifierQuantite(produitId: string, quantite: number) {
    await fetch(`/api/panier/${produitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantite }),
    });
    charger();
  }

  async function supprimer(produitId: string) {
    await fetch(`/api/panier/${produitId}`, { method: "DELETE" });
    charger();
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Mon panier</h1>

        {chargement ? (
          <p className="text-sm text-gray-500">Chargement...</p>
        ) : lignes.length === 0 ? (
          <p className="text-sm text-gray-500">Ton panier est vide.</p>
        ) : (
          <div className="space-y-4">
            {lignes.map((l) => (
              <div
                key={l.produitId}
                className="flex items-center gap-4 rounded-xl border bg-white p-4"
              >
                <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-100" />

                <div className="flex-1">
                  <p className="font-medium">{l.produit.nom}</p>
                  <p className="text-sm text-primary font-semibold">
                    {l.produit.prix.toFixed(0)} FC
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => modifierQuantite(l.produitId, l.quantite - 1)}
                    className="h-8 w-8 rounded-full border hover:border-primary"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{l.quantite}</span>
                  <button
                    onClick={() => modifierQuantite(l.produitId, l.quantite + 1)}
                    className="h-8 w-8 rounded-full border hover:border-primary"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => supprimer(l.produitId)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Retirer
                </button>
              </div>
            ))}

            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-lg font-semibold">Total produits</span>
              <span className="text-lg font-bold text-primary">
                {total.toFixed(0)} FC
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Les frais de livraison seront calculés à l'étape suivante.
            </p>

            <a
              href="/commande"
              className="block w-full rounded-lg bg-primary py-3 text-center font-medium text-white hover:bg-primary-dark"
            >
              Passer la commande
            </a>
          </div>
        )}
      </main>
    </>
  );
}
