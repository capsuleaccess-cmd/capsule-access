"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";

type Commande = {
  id: string;
  codeCommande: string;
  totalPaye: number;
  methodePaiement: string | null;
  preuvePaiementUrl: string | null;
  acheteur: { nom: string; email: string };
};

const libellesMethode: Record<string, string> = {
  M_PESA: "M-Pesa",
  ORANGE_MONEY: "Orange Money",
  AIRTEL_MONEY: "Airtel Money",
};

export default function AdminPaiementsPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  async function charger() {
    setChargement(true);
    const res = await fetch("/api/admin/paiements");
    if (res.ok) {
      setCommandes(await res.json());
    } else {
      const data = await res.json();
      setErreur(data.erreur || "Erreur de chargement.");
    }
    setChargement(false);
  }

  useEffect(() => {
    charger();
  }, []);

  async function traiter(id: string, approuve: boolean) {
    await fetch(`/api/admin/commandes/${id}/verifier-paiement`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approuve }),
    });
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
        <h1 className="mb-6 text-2xl font-bold">Preuves de paiement à vérifier</h1>

        {chargement ? (
          <p className="text-sm text-gray-500">Chargement...</p>
        ) : commandes.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune preuve en attente.</p>
        ) : (
          <div className="space-y-4">
            {commandes.map((c) => (
              <div key={c.id} className="rounded-xl border bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{c.codeCommande}</span>
                  <span className="text-sm font-semibold text-primary">
                    {c.totalPaye.toFixed(0)} FC
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {c.acheteur.nom} ({c.acheteur.email}) —{" "}
                  {c.methodePaiement && libellesMethode[c.methodePaiement]}
                </p>

                {c.preuvePaiementUrl && (
                  <img
                    src={c.preuvePaiementUrl}
                    alt="Preuve de paiement"
                    className="mt-3 max-h-64 rounded-lg border"
                  />
                )}

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => traiter(c.id, true)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                  >
                    ✓ Valider
                  </button>
                  <button
                    onClick={() => traiter(c.id, false)}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    ✗ Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
