"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { VILLES } from "@/lib/config";
import { calculerFraisLivraison } from "@/lib/fraisTransport";

type Adresse = { id: string; ville: string; quartier: string; details?: string | null };
type LignePanier = {
  produitId: string;
  quantite: number;
  produit: {
    nom: string;
    prix: number;
    boutiqueId: string;
    villeOrigine: string;
    quantiteExpediable: number;
    fraisTransport: number | null;
    fraisExpedition: number | null;
  };
};

export default function CommandePage() {
  const router = useRouter();
  const [lignes, setLignes] = useState<LignePanier[]>([]);
  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [adresseId, setAdresseId] = useState("");
  const [nouvelleAdresse, setNouvelleAdresse] = useState(false);
  const [ville, setVille] = useState("");
  const [quartier, setQuartier] = useState("");
  const [details, setDetails] = useState("");
  const [villeDestination, setVilleDestination] = useState("KISANGANI");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    async function charger() {
      const [resPanier, resAdresses] = await Promise.all([
        fetch("/api/panier"),
        fetch("/api/adresses"),
      ]);

      if (resPanier.status === 401) {
        router.push("/connexion");
        return;
      }

      const panier = await resPanier.json();
      setLignes(panier.lignes);

      const listeAdresses = await resAdresses.json();
      setAdresses(listeAdresses);
      if (listeAdresses.length > 0) {
        setAdresseId(listeAdresses[0].id);
      } else {
        setNouvelleAdresse(true);
      }

      setChargement(false);
    }
    charger();
  }, [router]);

  const totalProduits = lignes.reduce((s, l) => s + l.produit.prix * l.quantite, 0);

  const calculFrais = calculerFraisLivraison(
    lignes.map((l) => ({
      quantite: l.quantite,
      produit: {
        nom: l.produit.nom,
        boutiqueId: l.produit.boutiqueId,
        villeOrigine: l.produit.villeOrigine,
        fraisTransport: l.produit.fraisTransport,
        fraisExpedition: l.produit.fraisExpedition,
      },
    })),
    villeDestination
  );
  const typeLivraisonEstime = lignes.some((l) => l.produit.villeOrigine !== villeDestination)
    ? "EXPEDITION"
    : "LOCALE";
  const fraisLivraison = calculFrais.ok ? calculFrais.total : 0;
  const erreurFrais = calculFrais.ok ? "" : calculFrais.erreur;

  async function confirmerCommande(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);

    let finalAdresseId = adresseId;

    if (nouvelleAdresse) {
      const resAdresse = await fetch("/api/adresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ville, quartier, details }),
      });
      if (!resAdresse.ok) {
        const data = await resAdresse.json();
        setErreur(data.erreur || "Adresse invalide.");
        setEnvoi(false);
        return;
      }
      const nouvelle = await resAdresse.json();
      finalAdresseId = nouvelle.id;
    }

    const res = await fetch("/api/commandes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adresseId: finalAdresseId, villeDestination }),
    });

    setEnvoi(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    const commande = await res.json();
    router.push(`/commandes/${commande.id}/payer`);
  }

  if (chargement) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-12">
          <p className="text-sm text-gray-500">Chargement...</p>
        </main>
      </>
    );
  }

  if (lignes.length === 0) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-12">
          <p className="text-sm text-gray-500">
            Ton panier est vide.{" "}
            <a href="/" className="text-primary hover:underline">
              Continuer mes achats
            </a>
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Confirmer la commande</h1>

        <form onSubmit={confirmerCommande} className="space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Ville de destination</h2>
            <select
              value={villeDestination}
              onChange={(e) => setVilleDestination(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {VILLES.map((v) => (
                <option key={v.valeur} value={v.valeur}>{v.label}</option>
              ))}
            </select>
            {typeLivraisonEstime === "EXPEDITION" && (
              <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                📦 Un ou plusieurs produits viennent d'une autre ville : cette commande
                sera traitée en <strong>expédition inter-villes</strong> (via agence de
                transport, à convenir avec le vendeur après paiement).
              </p>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Adresse de livraison</h2>

            {adresses.length > 0 && (
              <div className="mb-3 space-y-2">
                {adresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                      !nouvelleAdresse && adresseId === a.id
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="adresse"
                      checked={!nouvelleAdresse && adresseId === a.id}
                      onChange={() => {
                        setAdresseId(a.id);
                        setNouvelleAdresse(false);
                      }}
                      className="mt-1"
                    />
                    <span className="text-sm">
                      {a.quartier}, {a.ville}
                      {a.details && <span className="block text-gray-500">{a.details}</span>}
                    </span>
                  </label>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setNouvelleAdresse(true)}
              className="text-sm text-primary hover:underline"
            >
              + Utiliser une nouvelle adresse
            </button>

            {nouvelleAdresse && (
              <div className="mt-3 space-y-3 rounded-lg border p-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Ville</label>
                  <input
                    type="text"
                    required
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Quartier</label>
                  <input
                    type="text"
                    required
                    value={quartier}
                    onChange={(e) => setQuartier(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Détails (repère, avenue, numéro...)
                  </label>
                  <input
                    type="text"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Récapitulatif</h2>
            <div className="space-y-2 rounded-lg border bg-white p-4 text-sm">
              {lignes.map((l) => (
                <div key={l.produitId} className="flex justify-between">
                  <span>{l.produit.nom} × {l.quantite}</span>
                  <span>{(l.produit.prix * l.quantite).toFixed(0)} FC</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 text-gray-600">
                <span>Sous-total</span>
                <span>{totalProduits.toFixed(0)} FC</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>
                  Livraison {typeLivraisonEstime === "EXPEDITION" ? "(expédition)" : "(locale)"}
                </span>
                <span>{erreurFrais ? "\u2014" : fraisLivraison.toFixed(0) + " FC"}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {erreurFrais ? "\u2014" : (totalProduits + fraisLivraison).toFixed(0) + " FC"}
                </span>
              </div>
            </div>
          </section>

          {erreurFrais && <p className="text-sm text-red-600">{erreurFrais}</p>}
          {erreur && <p className="text-sm text-red-600">{erreur}</p>}

          <button
            type="submit"
            disabled={envoi || erreurFrais !== ""}
            className="w-full rounded-lg bg-primary py-3 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {envoi ? "Confirmation..." : "Confirmer la commande"}
          </button>
        </form>
      </main>
    </>
  );
}
