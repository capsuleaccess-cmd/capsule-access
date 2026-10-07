"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClocheNotifications from "./ClocheNotifications";

export default function Header() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [connecte, setConnecte] = useState(false);
  const [deconnexionEnCours, setDeconnexionEnCours] = useState(false);

  useEffect(() => {
    fetch("/api/moi").then((res) => setConnecte(res.ok));
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(q.trim())}`);
    }
  }

  async function seDeconnecter() {
    setDeconnexionEnCours(true);
    await fetch("/api/auth/deconnexion", { method: "POST" });
    setDeconnexionEnCours(false);
    setConnecte(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="/" className="text-xl font-bold text-primary">Capsule Access</a>

        <form onSubmit={onSubmit} className="hidden flex-1 justify-center px-8 md:flex">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full max-w-md rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        <nav className="flex items-center gap-4 text-sm font-medium">
          <a href="/vendeur/dashboard" className="hover:text-primary">Vendre</a>
          <a href="/panier" className="hover:text-primary">Panier</a>
          <ClocheNotifications />
          {connecte ? (
            <button
              onClick={seDeconnecter}
              disabled={deconnexionEnCours}
              className="rounded-full border px-4 py-2 hover:border-red-400 hover:text-red-600 disabled:opacity-60"
            >
              {deconnexionEnCours ? "..." : "Déconnexion"}
            </button>
          ) : (
            <a href="/connexion" className="rounded-full bg-primary px-4 py-2 text-white hover:bg-primary-dark">
              Connexion
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}