"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function EvaluerCommandePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);

    const res = await fetch("/api/evaluations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commandeId: params.id, note, commentaire }),
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
        <h1 className="mb-6 text-2xl font-bold">Évaluer ma commande</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Note</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNote(n)}
                  className={`h-10 w-10 rounded-full border text-sm font-medium ${
                    note >= n
                      ? "border-primary bg-primary text-white"
                      : "text-gray-400"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Commentaire (optionnel)
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={4}
              placeholder="Comment s'est passée ta commande ?"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {erreur && <p className="text-sm text-red-600">{erreur}</p>}

          <button
            type="submit"
            disabled={envoi}
            className="w-full rounded-lg bg-primary py-3 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {envoi ? "Envoi..." : "Envoyer mon évaluation"}
          </button>
        </form>
      </main>
    </>
  );
}
