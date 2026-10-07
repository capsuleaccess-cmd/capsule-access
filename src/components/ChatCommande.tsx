"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  contenu: string;
  expediteurId: string;
  expediteur: { nom: string };
  createdAt: string;
};

export default function ChatCommande({
  commandeId,
  monId,
  ouvertParDefaut,
}: {
  commandeId: string;
  monId: string;
  ouvertParDefaut?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [ouvert, setOuvert] = useState(!!ouvertParDefaut);

  async function charger() {
    const res = await fetch(`/api/commandes/${commandeId}/messages`);
    if (res.ok) setMessages(await res.json());
  }

  useEffect(() => {
    if (!ouvert) return;
    charger();
    const intervalle = setInterval(charger, 8000);
    return () => clearInterval(intervalle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ouvert]);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (!texte.trim()) return;
    setEnvoi(true);
    await fetch(`/api/commandes/${commandeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenu: texte }),
    });
    setTexte("");
    setEnvoi(false);
    charger();
  }

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="mt-4 w-full rounded-lg border py-2 text-sm font-medium hover:border-primary hover:text-primary"
      >
        💬 Discuter de l'expédition
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border bg-white">
      <div className="flex items-center justify-between border-b p-3">
        <span className="text-sm font-semibold">Discussion — expédition</span>
        <button onClick={() => setOuvert(false)} className="text-xs text-gray-400">
          Fermer
        </button>
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-gray-400">
            Aucun message pour l'instant.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                m.expediteurId === monId
                  ? "ml-auto bg-primary text-white"
                  : "bg-gray-100"
              }`}
            >
              <p>{m.contenu}</p>
              <p
                className={`mt-1 text-[10px] ${
                  m.expediteurId === monId ? "text-white/70" : "text-gray-400"
                }`}
              >
                {m.expediteur.nom} ·{" "}
                {new Date(m.createdAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={envoyer} className="flex gap-2 border-t p-3">
        <input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Écrire un message..."
          className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={envoi}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
