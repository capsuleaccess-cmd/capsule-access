"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";

const categories = ["Électronique", "Mode", "Maison", "Alimentation", "Beauté", "Sport"];
const MAX_PHOTOS = 3;

type Produit = {
  id: string;
  nom: string;
  description: string | null;
  prix: number;
  stock: number;
  quantiteExpediable: number;
  fraisTransport: number | null;
  fraisExpedition: number | null;
  categorie: string | null;
  photos: string[];
  createdAt: string;
};

export default function ProduitsVendeurPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [editionId, setEditionId] = useState<string | null>(null);

  async function supprimer(id: string, nom: string) {
    if (!window.confirm('Supprimer le produit "' + nom + '" ? Cette action est définitive.')) return;
    try {
      const res = await fetch("/api/vendeur/produits/" + id, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        window.alert(data.erreur || "Suppression impossible.");
        return;
      }
      setProduits((liste) => liste.filter((p) => p.id !== id));
      setMessage("");
    } catch {
      window.alert("Impossible de contacter le serveur. Réessaie.");
    }
  }

  useEffect(() => {
    async function chargerProduits() {
      try {
        const res = await fetch("/api/vendeur/produits");
        const data = await res.json();

        if (!res.ok) {
          setErreur(data.erreur || "Impossible de charger les produits.");
          return;
        }

        setProduits(data);
      } catch {
        setErreur("Impossible de contacter le serveur. Réessaie.");
      } finally {
        setChargement(false);
      }
    }

    chargerProduits();
  }, []);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Mes produits</h1>
            <p className="mt-1 text-sm text-gray-500">
              Consulte et modifie les produits enregistrés dans ta boutique.
            </p>
          </div>
          <a
            href="/vendeur/produits/nouveau"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            + Ajouter un produit
          </a>
        </div>

        <div className="mb-5">
          <a href="/vendeur/dashboard" className="text-sm text-primary hover:underline">
            ← Retour au tableau de bord
          </a>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {chargement && <p className="text-sm text-gray-500">Chargement des produits...</p>}

        {!chargement && erreur && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{erreur}</p>
            {erreur.toLowerCase().includes("connect") && (
              <a href="/connexion" className="mt-2 inline-block underline">
                Se connecter
              </a>
            )}
          </div>
        )}

        {!chargement && !erreur && produits.length === 0 && (
          <div className="rounded-xl border bg-white p-6 text-center">
            <p className="mb-4 text-gray-600">Tu n’as pas encore ajouté de produit.</p>
            <a
              href="/vendeur/produits/nouveau"
              className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Ajouter mon premier produit
            </a>
          </div>
        )}

        {!chargement && !erreur && produits.length > 0 && (
          <div className="space-y-3">
            {produits.map((produit) =>
              editionId === produit.id ? (
                <FormulaireEdition
                  key={produit.id}
                  produit={produit}
                  onEnregistre={(produitMaj) => {
                    setProduits((liste) =>
                      liste.map((p) => (p.id === produitMaj.id ? produitMaj : p))
                    );
                    setEditionId(null);
                    setMessage(`« ${produitMaj.nom} » a été mis à jour ✓`);
                  }}
                  onAnnuler={() => setEditionId(null)}
                />
              ) : (
                <article
                  key={produit.id}
                  className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row"
                >
                  {produit.photos && produit.photos.length > 0 ? (
                    <img
                      src={produit.photos[0]}
                      alt={produit.nom}
                      className="h-28 w-28 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-center text-xs text-gray-500">
                      Aucune photo
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="text-lg font-semibold">{produit.nom}</h2>
                      <p className="font-bold text-primary">
                        {Number(produit.prix).toLocaleString("fr-FR")} FC
                      </p>
                    </div>
                    {produit.categorie && (
                      <p className="mt-1 text-sm text-gray-500">Catégorie : {produit.categorie}</p>
                    )}
                    {produit.description && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{produit.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <span className={produit.stock > 0 ? "text-gray-600" : "font-medium text-amber-700"}>
                        Stock : {produit.stock}
                      </span>
                      <span className="text-gray-500">
                        Photos : {produit.photos?.length ?? 0}/{MAX_PHOTOS}
                      </span>
                      <span className="text-gray-500">
                        Expédiable hors ville : {produit.quantiteExpediable ?? 0}
                      </span>
                      <span className={produit.fraisTransport === null || produit.fraisTransport === undefined ? "font-medium text-amber-700" : "text-gray-500"}>
                        {produit.fraisTransport === null || produit.fraisTransport === undefined
                          ? "Frais de transport non configur\u00e9s"
                          : produit.fraisTransport === 0
                          ? "Livraison gratuite"
                          : "Transport : " + Number(produit.fraisTransport).toLocaleString("fr-FR") + " FC"}
                      </span>
                      {(produit.quantiteExpediable ?? 0) > 0 && (
                        <span className={produit.fraisExpedition === null || produit.fraisExpedition === undefined ? "font-medium text-amber-700" : "text-gray-500"}>
                          {produit.fraisExpedition === null || produit.fraisExpedition === undefined
                            ? "Frais d'exp\u00e9dition non configur\u00e9s"
                            : produit.fraisExpedition === 0
                            ? "Exp\u00e9dition gratuite"
                            : "Exp\u00e9dition : " + Number(produit.fraisExpedition).toLocaleString("fr-FR") + " FC"}
                        </span>
                      )}
                      <span className="ml-auto flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setMessage("");
                            setEditionId(produit.id);
                          }}
                          className="font-medium text-primary hover:underline"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => supprimer(produit.id, produit.nom)}
                          className="font-medium text-red-600 hover:underline"
                        >
                          Supprimer
                        </button>
                      </span>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </main>
    </>
  );
}

function FormulaireEdition({
  produit,
  onEnregistre,
  onAnnuler,
}: {
  produit: Produit;
  onEnregistre: (produit: Produit) => void;
  onAnnuler: () => void;
}) {
  const [nom, setNom] = useState(produit.nom);
  const [description, setDescription] = useState(produit.description ?? "");
  const [prix, setPrix] = useState(String(produit.prix ?? ""));
  const [stock, setStock] = useState(String(produit.stock ?? 0));
  const [quantiteExpediable, setQuantiteExpediable] = useState(
    String(produit.quantiteExpediable ?? 0)
  );
  const [categorie, setCategorie] = useState(produit.categorie ?? categories[0]);
  const [photos, setPhotos] = useState<string[]>(produit.photos ?? []);
  const [modeTransport, setModeTransport] = useState<"GRATUIT" | "PAYANT" | "">(
    produit.fraisTransport === null || produit.fraisTransport === undefined
      ? ""
      : produit.fraisTransport === 0
      ? "GRATUIT"
      : "PAYANT"
  );
  const [fraisTransport, setFraisTransport] = useState(
    produit.fraisTransport && produit.fraisTransport > 0 ? String(produit.fraisTransport) : ""
  );
  const [modeExpedition, setModeExpedition] = useState<"GRATUIT" | "PAYANT" | "">(
    produit.fraisExpedition === null || produit.fraisExpedition === undefined
      ? ""
      : produit.fraisExpedition === 0
      ? "GRATUIT"
      : "PAYANT"
  );
  const [fraisExpedition, setFraisExpedition] = useState(
    produit.fraisExpedition && produit.fraisExpedition > 0 ? String(produit.fraisExpedition) : ""
  );
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  // Une catégorie déjà enregistrée mais absente de la liste doit rester
  // sélectionnable, sinon le vendeur la perdrait en enregistrant.
  const optionsCategorie =
    produit.categorie && !categories.includes(produit.categorie)
      ? [produit.categorie, ...categories]
      : categories;

  async function onChoisirPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier || photos.length >= MAX_PHOTOS) return;

    setErreur("");
    setUploadEnCours(true);

    const formData = new FormData();
    formData.append("fichier", fichier);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        setErreur(data.erreur || "Échec de l'upload.");
        return;
      }
      const { url } = await res.json();
      setPhotos((p) => [...p, url]);
    } catch {
      setErreur("Impossible de contacter le serveur. Réessaie.");
    } finally {
      setUploadEnCours(false);
    }
  }

  function retirerPhoto(index: number) {
    setPhotos((p) => p.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    let fraisTransportFinal: number | undefined = undefined;
    if (modeTransport === "GRATUIT") {
      fraisTransportFinal = 0;
    } else if (modeTransport === "PAYANT") {
      const montant = Number(fraisTransport);
      if (!fraisTransport.trim() || !Number.isFinite(montant) || montant <= 0) {
        setErreur("Saisis un montant de transport strictement positif.");
        return;
      }
      fraisTransportFinal = montant;
    }

    let fraisExpeditionFinal: number | undefined = undefined;
    if (Number(quantiteExpediable) > 0) {
      if (modeExpedition === "GRATUIT") {
        fraisExpeditionFinal = 0;
      } else if (modeExpedition === "PAYANT") {
        const montantExp = Number(fraisExpedition);
        if (!fraisExpedition.trim() || !Number.isFinite(montantExp) || montantExp <= 0) {
          setErreur("Saisis un montant d'exp\u00e9dition strictement positif.");
          return;
        }
        fraisExpeditionFinal = montantExp;
      }
    }

    setEnregistrement(true);

    try {
      const res = await fetch("/api/vendeur/produits/" + produit.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          description,
          prix,
          stock,
          quantiteExpediable,
          categorie,
          photos,
          ...(fraisTransportFinal !== undefined ? { fraisTransport: fraisTransportFinal } : {}),
          ...(fraisExpeditionFinal !== undefined ? { fraisExpedition: fraisExpeditionFinal } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErreur(data.erreur || "Enregistrement impossible.");
        return;
      }

      onEnregistre(data as Produit);
    } catch {
      setErreur("Impossible de contacter le serveur. Réessaie.");
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border-2 border-primary/40 bg-white p-4"
    >
      <h2 className="mb-4 font-semibold">Modifier « {produit.nom} »</h2>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Photos ({photos.length}/{MAX_PHOTOS})
          </label>
          <div className="flex flex-wrap gap-2">
            {photos.map((url, i) => (
              <div key={i} className="relative h-20 w-20">
                <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => retirerPhoto(i)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}

            {photos.length < MAX_PHOTOS && (
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed text-xs text-gray-500 hover:border-primary hover:text-primary">
                {uploadEnCours ? "..." : "+ Ajouter"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onChoisirPhoto}
                  disabled={uploadEnCours}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Nom du produit</label>
          <input
            type="text"
            required
            maxLength={120}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
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

        <div className="flex flex-wrap gap-4">
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-sm font-medium">Prix (FC)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-sm font-medium">Stock</label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-sm font-medium">Expédiable hors ville</label>
            <input
              type="number"
              min="0"
              value={quantiteExpediable}
              onChange={(e) => setQuantiteExpediable(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Catégorie</label>
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {optionsCategorie.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 rounded-lg border p-3">
        <p className="mb-2 text-sm font-medium">Frais de transport</p>
        {modeTransport === "" && (
          <p className="mb-2 text-xs text-amber-700">
            Les frais de ce produit ne sont pas encore configur&eacute;s : choisis une option ci-dessous.
          </p>
        )}
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="radio"
              name="modeTransportEdition"
              value="GRATUIT"
              checked={modeTransport === "GRATUIT"}
              onChange={() => {
                setModeTransport("GRATUIT");
                setFraisTransport("");
              }}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium">Livraison gratuite</span>
              <span className="block text-xs text-gray-500">Aucun frais de transport pour ce produit.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="radio"
              name="modeTransportEdition"
              value="PAYANT"
              checked={modeTransport === "PAYANT"}
              onChange={() => setModeTransport("PAYANT")}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium">Livraison payante</span>
              <span className="block text-xs text-gray-500">Tu fixes le montant des frais en FC.</span>
            </span>
          </label>
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-sm font-medium">Montant des frais (FC)</label>
          <input
            type="number"
            min="1"
            step="1"
            required={modeTransport === "PAYANT"}
            disabled={modeTransport !== "PAYANT"}
            value={fraisTransport}
            onChange={(e) => setFraisTransport(e.target.value)}
            placeholder="Ex. : 3000"
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          />
        </div>
      </div>

      {Number(quantiteExpediable) > 0 && (
        <div className="mt-4 rounded-lg border p-3">
          <p className="mb-2 text-sm font-medium">Frais d&apos;exp&eacute;dition vers une autre ville</p>
          {modeExpedition === "" && (
            <p className="mb-2 text-xs text-amber-700">
              Les frais d&apos;exp&eacute;dition de ce produit ne sont pas encore configur&eacute;s : choisis une option ci-dessous.
            </p>
          )}
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="radio"
                name="modeExpeditionEdition"
                value="GRATUIT"
                checked={modeExpedition === "GRATUIT"}
                onChange={() => {
                  setModeExpedition("GRATUIT");
                  setFraisExpedition("");
                }}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium">Exp&eacute;dition gratuite</span>
                <span className="block text-xs text-gray-500">Aucun frais d&apos;exp&eacute;dition pour ce produit.</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="radio"
                name="modeExpeditionEdition"
                value="PAYANT"
                checked={modeExpedition === "PAYANT"}
                onChange={() => setModeExpedition("PAYANT")}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium">Exp&eacute;dition payante</span>
                <span className="block text-xs text-gray-500">Tu fixes le montant des frais en FC.</span>
              </span>
            </label>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium">Montant des frais d&apos;exp&eacute;dition (FC)</label>
            <input
              type="number"
              min="1"
              step="1"
              required={modeExpedition === "PAYANT"}
              disabled={modeExpedition !== "PAYANT"}
              value={fraisExpedition}
              onChange={(e) => setFraisExpedition(e.target.value)}
              placeholder="Ex. : 8000"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        </div>
      )}

      {erreur && <p className="mt-4 text-sm text-red-600">{erreur}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={enregistrement || uploadEnCours}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {enregistrement ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
        <button
          type="button"
          onClick={onAnnuler}
          disabled={enregistrement}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary disabled:opacity-60"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
