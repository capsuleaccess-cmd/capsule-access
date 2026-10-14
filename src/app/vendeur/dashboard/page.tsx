"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";

type Stats = {
  boutique: { nom: string; verifiee: boolean };
  produitsTotal: number;
  produitsEnRupture: number;
  commandesCompletees: number;
  commandesEnCours: number;
  revenuBrut: number;
  commission: number;
  revenuNet: number;
  noteMoyenne: number | null;
  nombreAvis: number;
};

export default function VendeurDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function charger() {
      const res = await fetch("/api/vendeur/dashboard");
      if (res.status === 404) {
        setErreur("Tu n'as pas encore de boutique.");
      } else if (res.ok) {
        setStats(await res.json());
      } else {
        setErreur("Une erreur est survenue.");
      }
      setChargement(false);
    }
    charger();
  }, []);

  if (chargement) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <p className="text-sm text-gray-500">Chargement...</p>
        </main>
      </>
    );
  }

  if (erreur) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <p className="mb-4 text-sm text-gray-600">{erreur}</p>
          <a
            href="/vendeur/boutique"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Créer ma boutique
          </a>
        </main>
      </>
    );
  }

  if (!stats) return null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{stats.boutique.nom}</h1>
            <p className="text-sm text-gray-500">
              {stats.boutique.verifiee ? "Boutique vérifiée ✓" : "En attente de vérification"}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/vendeur/produits/nouveau"
              className="rounded-lg border px-3 py-2 text-sm font-medium hover:border-primary hover:text-primary"
            >
              + Produit
            </a>
            <a
              href="/vendeur/produits"
              className="rounded-lg border px-3 py-2 text-sm font-medium hover:border-primary hover:text-primary"
            >
              Mes produits
            </a>
            <a
              href="/vendeur/livreurs"
              className="rounded-lg border px-3 py-2 text-sm font-medium hover:border-primary hover:text-primary"
            >
              🚴 Livreurs
            </a>
            <a
              href="/vendeur/commandes"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Commandes
            </a>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Carte titre="Revenu net" valeur={`${stats.revenuNet.toFixed(0)} FC`} accent />
          <Carte titre="Commandes complétées" valeur={String(stats.commandesCompletees)} />
          <Carte titre="Commandes en cours" valeur={String(stats.commandesEnCours)} />
          <Carte
            titre="Note moyenne"
            valeur={stats.noteMoyenne ? `${stats.noteMoyenne.toFixed(1)} / 5` : "—"}
            sousTitre={stats.nombreAvis > 0 ? `${stats.nombreAvis} avis` : "Aucun avis"}
          />
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 font-semibold">Détail des revenus</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenu brut (ventes livrées)</span>
              <span>{stats.revenuBrut.toFixed(0)} FC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Commission Capsule Access (5%)</span>
              <span className="text-red-600">− {stats.commission.toFixed(0)} FC</span>
            </div>
            <div className="flex justify-between border-t pt-1 font-semibold">
              <span>Revenu net</span>
              <span className="text-primary">{stats.revenuNet.toFixed(0)} FC</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border bg-white p-4 text-sm">
          <p>
            <span className="font-medium">{stats.produitsTotal}</span> produits au
            catalogue
            {stats.produitsEnRupture > 0 && (
              <span className="text-amber-600">
                {" "}
                — {stats.produitsEnRupture} en rupture de stock
              </span>
            )}
          </p>
        </div>
      </main>
    </>
  );
}

function Carte({
  titre,
  valeur,
  sousTitre,
  accent,
}: {
  titre: string;
  valeur: string;
  sousTitre?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-xs text-gray-500">{titre}</p>
      <p className={`text-xl font-bold ${accent ? "text-primary" : ""}`}>{valeur}</p>
      {sousTitre && <p className="text-xs text-gray-400">{sousTitre}</p>}
    </div>
  );
}
