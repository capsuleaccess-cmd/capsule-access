"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmerReceptionBouton({
  commandeId,
}: {
  commandeId: string;
}) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  async function onConfirmer() {
    setErreur("");
    setChargement(true);
    const res = await fetch(`/api/commandes/${commandeId}/confirmer-reception`, {
      method: "POST",
    });
    setChargement(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <p className="mb-2 text-sm font-medium">As-tu bien reçu ton colis ?</p>
      <p className="mb-3 text-xs text-gray-500">
        En confirmant, tu libères les fonds au vendeur — assure-toi d'avoir bien
        reçu ta commande avant de confirmer.
      </p>
      {erreur && <p className="mb-2 text-sm text-red-600">{erreur}</p>}
      <button
        onClick={onConfirmer}
        disabled={chargement}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {chargement ? "Confirmation..." : "✓ Confirmer la réception"}
      </button>
    </div>
  );
}
