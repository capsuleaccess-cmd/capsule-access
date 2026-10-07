"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";

type Livreur = { id: string; nom: string; telephone: string };
type Commande = {
  id: string;
  codeCommande: string;
  statut: string;
  typeLivraison: string;
  villeDestination: string;
  totalPaye: number;
  adresse: { ville: string; quartier: string };
  lignes: { quantite: number; produit: { nom: string } }[];
  agentLivraison: Livreur | null;
};

const libelles: Record<string, string> = {
  CONFIRMEE: "Confirmée",
  EN_PREPARATION: "En préparation",
  PRETE: "Prête",
  EN_LIVRAISON: "En livraison",
};

const actionSuivante: Record<string, string> = {
  CONFIRMEE: "Commencer la préparation",
  EN_PREPARATION: "Marquer comme prête",
};

const libellesVille: Record<string, string> = {
  KISANGANI: "Kisangani",
  KINSHASA: "Kinshasa",
  LUBUMBASHI: "Lubumbashi",
};

export default function VendeurCommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [choixLivreur, setChoixLivreur] = useState<Record<string, string>>({});
  const [chargement, setChargement] = useState(true);

  async function charger() {
    setChargement(true);
    const res = await fetch("/api/vendeur/commandes");
    if (res.ok) {
      const data = await res.json();
      setCommandes(data.commandes);
      setLivreurs(data.livreurs);
    }
    setChargement(false);
  }

  useEffect(() => {
    charger();
  }, []);

  async function avancer(id: string) {
    await fetch(`/api/vendeur/commandes/${id}/statut`, { method: "PATCH" });
    charger();
  }

  async function expedier(id: string) {
    const agentLivraisonId = choixLivreur[id];
    if (!agentLivraisonId) return;
    await fetch(`/api/vendeur/commandes/${id}/expedier`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentLivraisonId }),
    });
    charger();
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Commandes à traiter</h1>
          <a
            href="/vendeur/livreurs"
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:border-primary hover:text-primary"
          >
            🚴 Mes livreurs
          </a>
        </div>

        {chargement ? (
          <p className="text-sm text-gray-500">Chargement...</p>
        ) : commandes.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune commande en attente.</p>
        ) : (
          <div className="space-y-3">
            {commandes.map((c) => (
              <div key={c.id} className="rounded-xl border bg-white p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{c.codeCommande}</span>
                  <div className="flex items-center gap-2">
                    {c.typeLivraison === "EXPEDITION" && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
                        📦 Expédition → {libellesVille[c.villeDestination]}
                      </span>
                    )}
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                      {libelles[c.statut]}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {c.lignes.map((l) => `${l.produit.nom} × ${l.quantite}`).join(", ")}
                </p>
                <p className="text-xs text-gray-500">
                  Livraison : {c.adresse.quartier}, {c.adresse.ville}
                </p>

                {c.typeLivraison === "EXPEDITION" && (
                  <a
                    href={`/vendeur/commandes/${c.id}/chat`}
                    className="mt-2 inline-block text-xs text-primary hover:underline"
                  >
                    💬 Discuter de l'agence de transport
                  </a>
                )}

                {c.statut === "PRETE" && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {livreurs.length === 0 ? (
                      <p className="text-xs text-amber-600">
                        Ajoute d'abord un livreur dans{" "}
                        <a href="/vendeur/livreurs" className="underline">
                          Mes livreurs
                        </a>
                        .
                      </p>
                    ) : (
                      <>
                        <select
                          value={choixLivreur[c.id] || ""}
                          onChange={(e) =>
                            setChoixLivreur({ ...choixLivreur, [c.id]: e.target.value })
                          }
                          className="rounded-lg border px-3 py-2 text-sm"
                        >
                          <option value="">Sélectionner un livreur</option>
                          {livreurs.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.nom} ({l.telephone})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => expedier(c.id)}
                          disabled={!choixLivreur[c.id]}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                        >
                          🚀 Expédier
                        </button>
                      </>
                    )}
                  </div>
                )}

                {c.statut === "EN_LIVRAISON" && (
                  <p className="mt-2 text-sm text-gray-600">
                    {c.agentLivraison
                      ? `En route avec ${c.agentLivraison.nom} (${c.agentLivraison.telephone})`
                      : "En cours d'expédition"}{" "}
                    — en attente de confirmation de réception par le client.
                  </p>
                )}

                {actionSuivante[c.statut] && (
                  <button
                    onClick={() => avancer(c.id)}
                    className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                  >
                    {actionSuivante[c.statut]}
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
