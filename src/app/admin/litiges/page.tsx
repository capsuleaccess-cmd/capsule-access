"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";

type Litige = {
  id: string;
  motif: string;
  description?: string | null;
  statut: string;
  decision?: string | null;
  commandeId: string;
  auteur: { nom: string; email: string };
  commande: { totalPaye: number };
};

const libellesStatut: Record<string, string> = {
  OUVERT: "Ouvert",
  EN_EXAMEN: "En examen",
  RESOLU_REMBOURSEMENT: "Résolu — remboursement",
  RESOLU_REMPLACEMENT: "Résolu — remplacement",
  RESOLU_AUTRE: "Résolu — autre",
  REJETE: "Rejeté",
};

export default function AdminLitigesPage() {
  const [litiges, setLitiges] = useState<Litige[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [decisionEnCours, setDecisionEnCours] = useState<Record<string, string>>({});

  async function charger() {
    setChargement(true);
    const res = await fetch("/api/litiges");
    if (res.ok) {
      setLitiges(await res.json());
    } else {
      const data = await res.json();
      setErreur(data.erreur || "Erreur de chargement.");
    }
    setChargement(false);
  }

  useEffect(() => {
    charger();
  }, []);

  async function resoudre(id: string, resolution: string) {
    const decision = decisionEnCours[id] || "";
    await fetch(`/api/admin/litiges/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution, decision }),
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
        <h1 className="mb-6 text-2xl font-bold">Litiges</h1>

        {chargement ? (
          <p className="text-sm text-gray-500">Chargement...</p>
        ) : litiges.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun litige.</p>
        ) : (
          <div className="space-y-4">
            {litiges.map((l) => (
              <div key={l.id} className="rounded-xl border bg-white p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">{l.motif}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                    {libellesStatut[l.statut]}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {l.auteur.nom} ({l.auteur.email}) — commande #{l.commandeId.slice(-8)}{" "}
                  — {l.commande.totalPaye.toFixed(0)} FC
                </p>
                {l.description && (
                  <p className="mt-1 text-sm text-gray-500">{l.description}</p>
                )}

                {l.statut === "OUVERT" || l.statut === "EN_EXAMEN" ? (
                  <div className="mt-3 space-y-2 border-t pt-3">
                    <textarea
                      placeholder="Note sur la décision (optionnel)"
                      value={decisionEnCours[l.id] || ""}
                      onChange={(e) =>
                        setDecisionEnCours({ ...decisionEnCours, [l.id]: e.target.value })
                      }
                      rows={2}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => resoudre(l.id, "REMBOURSEMENT")}
                        className="rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
                      >
                        Rembourser
                      </button>
                      <button
                        onClick={() => resoudre(l.id, "REMPLACEMENT")}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
                      >
                        Remplacer
                      </button>
                      <button
                        onClick={() => resoudre(l.id, "AUTRE")}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
                      >
                        Autre solution
                      </button>
                      <button
                        onClick={() => resoudre(l.id, "REJET")}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Rejeter
                      </button>
                    </div>
                  </div>
                ) : (
                  l.decision && (
                    <p className="mt-2 text-sm text-gray-500">
                      Décision : {l.decision}
                    </p>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
