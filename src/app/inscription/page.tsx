"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function InscriptionPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [role, setRole] = useState<"ACHETEUR" | "VENDEUR">("ACHETEUR");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    const res = await fetch("/api/auth/inscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, email, motDePasse, role }),
    });

    setChargement(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="mb-6 text-2xl font-bold">Créer un compte</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nom complet</label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Je veux</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("ACHETEUR")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  role === "ACHETEUR" ? "border-primary bg-primary/10 text-primary" : ""
                }`}
              >
                Acheter
              </button>
              <button
                type="button"
                onClick={() => setRole("VENDEUR")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  role === "VENDEUR" ? "border-primary bg-primary/10 text-primary" : ""
                }`}
              >
                Vendre
              </button>
            </div>
          </div>

          {erreur && <p className="text-sm text-red-600">{erreur}</p>}

          <button
            type="submit"
            disabled={chargement}
            className="w-full rounded-lg bg-primary py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {chargement ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Déjà un compte ?{" "}
          <a href="/connexion" className="text-primary hover:underline">
            Se connecter
          </a>
        </p>
      </main>
    </>
  );
}
