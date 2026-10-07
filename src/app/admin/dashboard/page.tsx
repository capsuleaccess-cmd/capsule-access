"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";

type Stats = {
  totalUtilisateurs: number;
  totalVendeurs: number;
  totalBoutiquesNonVerifiees: number;
  totalProduits: number;
  totalCommandes: number;
  litigesOuverts: number;
  ventesTotales: number;
  revenuCommissions: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function charger() {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        setStats(await res.json());
      } else {
        setErreur("Accès réservé à l'administrateur.");
      }
      setChargement(false);
    }
    charger();
  }, []);

  if (chargement) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <p className="text-sm text-gray-500">Chargement...</p>
        </main>
      </>
    );
  }

  if (erreur || !stats) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <p className="text-sm text-red-600">{erreur}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Administration</h1>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Carte titre="Utilisateurs" valeur={String(stats.totalUtilisateurs)} />
          <Carte titre="Vendeurs" valeur={String(stats.totalVendeurs)} />
          <Carte titre="Produits" valeur={String(stats.totalProduits)} />
          <Carte titre="Commandes" valeur={String(stats.totalCommandes)} />
          <Carte
            titre="Ventes totales"
            valeur={`${stats.ventesTotales.toFixed(0)} FC`}
            accent
          />
          <Carte
            titre="Commissions perçues"
            valeur={`${stats.revenuCommissions.toFixed(0)} FC`}
            accent
          />
          <Carte
            titre="Boutiques à vérifier"
            valeur={String(stats.totalBoutiquesNonVerifiees)}
            alerte={stats.totalBoutiquesNonVerifiees > 0}
          />
          <Carte
            titre="Litiges ouverts"
            valeur={String(stats.litigesOuverts)}
            alerte={stats.litigesOuverts > 0}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/boutiques"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
          >
            Gérer les boutiques
          </a>
          <a
            href="/admin/litiges"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
          >
            Gérer les litiges
          </a>
          <a
            href="/admin/utilisateurs"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
          >
            Voir les utilisateurs
          </a>
        </div>
      </main>
    </>
  );
}

function Carte({
  titre,
  valeur,
  accent,
  alerte,
}: {
  titre: string;
  valeur: string;
  accent?: boolean;
  alerte?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 ${alerte ? "border-amber-300 bg-amber-50" : ""}`}
    >
      <p className="text-xs text-gray-500">{titre}</p>
      <p
        className={`text-xl font-bold ${
          accent ? "text-primary" : alerte ? "text-amber-700" : ""
        }`}
      >
        {valeur}
      </p>
    </div>
  );
}
