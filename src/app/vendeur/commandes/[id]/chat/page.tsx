"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ChatCommande from "@/components/ChatCommande";

export default function VendeurChatCommandePage({
  params,
}: {
  params: { id: string };
}) {
  const [monId, setMonId] = useState("");
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function charger() {
      const res = await fetch("/api/moi");
      if (res.ok) {
        const data = await res.json();
        setMonId(data.id);
      }
      setChargement(false);
    }
    charger();
  }, []);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-1 text-xl font-bold">
          Discussion — commande #{params.id.slice(-8)}
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Conviens de l'agence de transport et des modalités d'expédition avec
          le client.
        </p>

        {!chargement && monId && (
          <ChatCommande commandeId={params.id} monId={monId} ouvertParDefaut />
        )}

        <a
          href="/vendeur/commandes"
          className="mt-6 block text-center text-sm text-primary hover:underline"
        >
          Retour aux commandes
        </a>
      </main>
    </>
  );
}
