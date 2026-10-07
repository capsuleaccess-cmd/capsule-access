"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BoutonAjouterPanier({
  produitId,
  enStock,
}: {
  produitId: string;
  enStock: boolean;
}) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [ajoute, setAjoute] = useState(false);

  async function onClick() {
    setChargement(true);
    const res = await fetch("/api/panier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produitId, quantite: 1 }),
    });
    setChargement(false);

    if (res.status === 401) {
      router.push("/connexion");
      return;
    }

    if (res.ok) {
      setAjoute(true);
      setTimeout(() => setAjoute(false), 2000);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={!enStock || chargement}
      className="mt-6 w-full rounded-lg bg-primary py-3 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
    >
      {!enStock ? "Rupture de stock" : ajoute ? "Ajouté ✓" : chargement ? "Ajout..." : "Ajouter au panier"}
    </button>
  );
}
