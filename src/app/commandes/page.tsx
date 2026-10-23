"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";

type Commande = {
  id: string;
  codeCommande: string;
  statut: string;
  totalPaye: number;
  statutPaiement: string;
  createdAt: string;
  lignes: {
    id: string;
    quantite: number;
    produit: {
      nom: string;
    };
  }[];
};

const libellesStatut: Record<string, string> = {
  EN_ATTENTE: "En attente de paiement",
  PAYEE: "Payée",
  CONFIRMEE: "Confirmée — en préparation",
  EN_PREPARATION: "En préparation",
  PRETE: "Prête pour expédition",
  EN_LIVRAISON: "En livraison",
  LIVREE: "Livrée",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
  LITIGE: "Litige en cours",
};

export default function CommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function charger() {
      const res = await fetch("/api/commandes");

      if (res.status === 401) {
        window.location.href = "/connexion";
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setCommandes(data);
      }

      setChargement(false);
    }

    charger();
  }, []);

  if (chargement) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-sm text-gray-500">Chargement de tes commandes...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Mes commandes</h1>

        {commandes.filter((c) => c.statutPaiement === "EN_ATTENTE_PREUVE").length > 1 && (
          <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            Ton panier contenait des produits de plusieurs boutiques : chaque boutique a sa propre
            commande, &agrave; payer s&eacute;par&eacute;ment avec le bouton &laquo; Payer cette commande &raquo;.
          </div>
        )}

        {commandes.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-center">
            <p className="text-gray-500">Tu n'as encore aucune commande.</p>

            <a
              href="/"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Commencer mes achats
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {commandes.map((commande) => (
              <div
                key={commande.id}
                className="rounded-xl border bg-white p-5"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <p className="font-semibold">
                      Commande {commande.codeCommande}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(commande.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  <p className="font-semibold text-primary">
                    {Number(commande.totalPaye).toLocaleString("fr-FR")} FC
                  </p>
                </div>

                <div className="mt-4 border-t pt-4">
                  {commande.lignes.map((ligne) => (
                    <p key={ligne.id} className="text-sm text-gray-700">
                      {ligne.produit.nom} × {ligne.quantite}
                    </p>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium">
                    {libellesStatut[commande.statut] || commande.statut}
                  </span>

                  {commande.statutPaiement === "EN_ATTENTE_PREUVE" && (
                    <a
                      href={`/commandes/${commande.id}/payer`}
                      className="rounded-lg border border-primary px-4 py-2 text-center text-sm font-medium text-primary hover:bg-primary/5"
                    >
                      Payer cette commande
                    </a>
                  )}

                  <a
                    href={`/commandes/${commande.id}`}
                    className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-dark"
                  >
                    Suivre ma commande
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}