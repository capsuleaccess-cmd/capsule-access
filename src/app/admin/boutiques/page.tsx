"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";

type Boutique = {
  id: string;
  nom: string;
  verifiee: boolean;
  proprietaire: { nom: string; email: string };
  produits: { id: string }[];
};

export default function AdminBoutiquesPage() {
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  async function charger() {
    setChargement(true);
    const res = await fetch("/api/admin/boutiques");
    if (res.ok) {
      setBoutiques(await res.json());
    } else {
      const data = await res.json();
      setErreur(data.erreur || "Erreur de chargement.");
    }
    setChargement(false);
  }

  useEffect(() => {
    charger();
  }, []);

  async function verifier(id: string) {
    await fetch(`/api/admin/boutiques/${id}/verifier`, { method: "POST" });
    charger();
  }

  if (erreur) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <p className="text-sm text-red-600">{erreur}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Boutiques</h1>

        {chargement ? (
          <p className="text-sm text-gray-500">Chargement...</p>
        ) : (
          <div className="space-y-3">
            {boutiques.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border bg-white p-4"
              >
                <div>
                  <p className="font-medium">{b.nom}</p>
                  <p className="text-sm text-gray-500">
                    {b.proprietaire.nom} ({b.proprietaire.email}) — {b.produits.length} produits
                  </p>
                </div>

                {b.verifiee ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Vérifiée
                  </span>
                ) : (
                  <button
                    onClick={() => verifier(b.id)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
                  >
                    Vérifier
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
