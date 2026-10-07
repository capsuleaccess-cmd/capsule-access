"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { VILLES } from "@/lib/config";

const methodesRetrait = [
  { id: "M_PESA", label: "M-Pesa" },
  { id: "ORANGE_MONEY", label: "Orange Money" },
  { id: "AIRTEL_MONEY", label: "Airtel Money" },
];

export default function BoutiquePage() {
  const router = useRouter();
  const [chargementInitial, setChargementInitial] = useState(true);
  const [boutique, setBoutique] = useState<any>(null);

  // Création
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [ville, setVille] = useState("KISANGANI");

  // Retrait
  const [modeRetraitPaiement, setModeRetraitPaiement] = useState("M_PESA");
  const [numeroRetraitPaiement, setNumeroRetraitPaiement] = useState("");
  const [nomTitulaireCompte, setNomTitulaireCompte] = useState("");

  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    async function charger() {
      const res = await fetch("/api/boutique");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setBoutique(data);
          setModeRetraitPaiement(data.modeRetraitPaiement || "M_PESA");
          setNumeroRetraitPaiement(data.numeroRetraitPaiement || "");
          setNomTitulaireCompte(data.nomTitulaireCompte || "");
        }
      }
      setChargementInitial(false);
    }
    charger();
  }, []);

  async function creerBoutique(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    const res = await fetch("/api/boutique", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, description, ville }),
    });

    setChargement(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    router.push("/vendeur/produits/nouveau");
  }

  async function enregistrerRetrait(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setSucces("");
    setChargement(true);

    const res = await fetch("/api/boutique", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modeRetraitPaiement,
        numeroRetraitPaiement,
        nomTitulaireCompte,
      }),
    });

    setChargement(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    setSucces("Coordonnées de retrait enregistrées ✓");
  }

  if (chargementInitial) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-md px-4 py-12">
          <p className="text-sm text-gray-500">Chargement...</p>
        </main>
      </>
    );
  }

  if (!boutique) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-md px-4 py-12">
          <h1 className="mb-2 text-2xl font-bold">Créer ma boutique</h1>
          <p className="mb-6 text-sm text-gray-600">
            Ta boutique doit être vérifiée avant de vendre publiquement. Tu peux
            commencer à ajouter tes produits dès maintenant.
          </p>

          <form onSubmit={creerBoutique} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nom de la boutique</label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Ville</label>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {VILLES.map((v) => (
                  <option key={v.valeur} value={v.valeur}>{v.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {erreur && <p className="text-sm text-red-600">{erreur}</p>}

            <button
              type="submit"
              disabled={chargement}
              className="w-full rounded-lg bg-primary py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {chargement ? "Création..." : "Créer ma boutique"}
            </button>
          </form>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="mb-1 text-2xl font-bold">{boutique.nom}</h1>
        <p className="mb-6 text-sm text-gray-500">
          {boutique.ville} — {boutique.verifiee ? "Boutique vérifiée ✓" : "En attente de vérification"}
        </p>

        <form onSubmit={enregistrerRetrait} className="space-y-4 rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Coordonnées de retrait</h2>
          <p className="text-xs text-gray-500">
            C'est là que les fonds libérés par tes clients te seront envoyés.
          </p>

          <div>
            <label className="mb-1 block text-sm font-medium">Mode de retrait</label>
            <div className="flex gap-2">
              {methodesRetrait.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModeRetraitPaiement(m.id)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                    modeRetraitPaiement === m.id
                      ? "border-primary bg-primary/5 text-primary"
                      : ""
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Numéro</label>
            <input
              type="tel"
              required
              placeholder="+243..."
              value={numeroRetraitPaiement}
              onChange={(e) => setNumeroRetraitPaiement(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Nom du titulaire</label>
            <input
              type="text"
              required
              value={nomTitulaireCompte}
              onChange={(e) => setNomTitulaireCompte(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {erreur && <p className="text-sm text-red-600">{erreur}</p>}
          {succes && <p className="text-sm text-green-600">{succes}</p>}

          <button
            type="submit"
            disabled={chargement}
            className="w-full rounded-lg bg-primary py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {chargement ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </main>
    </>
  );
}
