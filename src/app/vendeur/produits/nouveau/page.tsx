"use client";

import { useState } from "react";
import Header from "@/components/Header";

const categories = ["Électronique", "Mode", "Maison", "Alimentation", "Beauté", "Sport"];
const MAX_PHOTOS = 3;

export default function NouveauProduitPage() {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [stock, setStock] = useState("");
  const [quantiteExpediable, setQuantiteExpediable] = useState("");
  const [categorie, setCategorie] = useState(categories[0]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);
  const [chargement, setChargement] = useState(false);

  async function onChoisirPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier || photos.length >= MAX_PHOTOS) return;

    setErreur("");
    setUploadEnCours(true);

    const formData = new FormData();
    formData.append("fichier", fichier);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploadEnCours(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.erreur || "Échec de l'upload.");
      return;
    }

    const { url } = await res.json();
    setPhotos((p) => [...p, url]);
  }

  function retirerPhoto(index: number) {
    setPhotos((p) => p.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setSucces(false);
    setChargement(true);

    const res = await fetch("/api/produits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, description, prix, stock, categorie, photos, quantiteExpediable }),
    });

    setChargement(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    setSucces(true);
    setNom("");
    setDescription("");
    setPrix("");
    setStock("");
    setPhotos([]);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="mb-6 text-2xl font-bold">Ajouter un produit</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Photos ({photos.length}/{MAX_PHOTOS})</label>
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

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Prix (FC)</label>
              <input
                type="number"
                step="0.01"
                required
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Quantité expédiable hors de ta ville
            </label>
            <input
              type="number"
              value={quantiteExpediable}
              onChange={(e) => setQuantiteExpediable(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-gray-500">
              Laisse à 0 si tu ne veux vendre que localement.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Catégorie</label>
            <select
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {erreur && <p className="text-sm text-red-600">{erreur}</p>}
          {succes && <p className="text-sm text-green-600">Produit ajouté ✓</p>}

          <button
            type="submit"
            disabled={chargement || uploadEnCours}
            className="w-full rounded-lg bg-primary py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {chargement ? "Ajout..." : "Ajouter le produit"}
          </button>
        </form>
      </main>
    </>
  );
}
