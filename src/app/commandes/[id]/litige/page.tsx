"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const motifs = [
  "Produit non reçu",
  "Produit endommagé",
  "Produit différent de la commande",
  "Quantité incorrecte",
  "Autre",
];

export default function LitigeCommandePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [motif, setMotif] = useState(motifs[0]);
  const [description, setDescription] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);

    const res = await fetch("/api/litiges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commandeId: params.id, motif, description }),
    });

    setEnvoi(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    router.push(`/commandes/${params.id}`);
    router.refresh();
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="mb-2 text-2xl font-bold">Signaler un problème</h1>
        <p className="mb-6 text-sm text-gray-600">
          Notre équipe examine ta demande et te propose une solution
          (remboursement, remplacement, ou autre).
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Motif</label>
            <select
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {motifs.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Décris le problème
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {erreur && <p className="text-sm text-red-600">{erreur}</p>}

          <button
            type="submit"
            disabled={envoi}
            className="w-full rounded-lg bg-primary py-3 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {envoi ? "Envoi..." : "Envoyer le signalement"}
          </button>
        </form>
      </main>
    </>
  );
}
