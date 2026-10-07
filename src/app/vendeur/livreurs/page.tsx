"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";

type Livreur = {
  id: string;
  nom: string;
  telephone: string;
  photoUrl: string | null;
};

export default function VendeurLivreursPage() {
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);

  const [enEdition, setEnEdition] = useState<string | null>(null);
  const [editNom, setEditNom] = useState("");
  const [editTelephone, setEditTelephone] = useState("");

  function ouvrirEdition(l: Livreur) {
    setEnEdition(l.id);
    setEditNom(l.nom);
    setEditTelephone(l.telephone);
  }

  async function sauvegarderEdition(id: string) {
    await fetch(`/api/vendeur/livreurs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: editNom, telephone: editTelephone }),
    });
    setEnEdition(null);
    charger();
  }

  async function charger() {
    setChargement(true);
    const res = await fetch("/api/vendeur/livreurs");
    if (res.ok) setLivreurs(await res.json());
    setChargement(false);
  }

  useEffect(() => {
    charger();
  }, []);

  async function onChoisirPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;

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
    setPhotoUrl(url);
  }

  async function ajouterLivreur(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnregistrement(true);

    const res = await fetch("/api/vendeur/livreurs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, telephone, photoUrl: photoUrl || undefined }),
    });

    setEnregistrement(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    setNom("");
    setTelephone("");
    setPhotoUrl("");
    charger();
  }

  async function supprimer(id: string) {
    await fetch(`/api/vendeur/livreurs/${id}`, { method: "DELETE" });
    charger();
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold">Mes livreurs</h1>
        <p className="mb-6 text-sm text-gray-600">
          Gère l'équipe qui livre tes commandes. Tu les assignes ensuite depuis{" "}
          <a href="/vendeur/commandes" className="text-primary hover:underline">
            Commandes
          </a>
          .
        </p>

        <form
          onSubmit={ajouterLivreur}
          className="mb-8 space-y-3 rounded-xl border bg-white p-4"
        >
          <h2 className="font-semibold">+ Ajouter un livreur</h2>

          <div className="flex items-center gap-3">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400">
                Photo
              </div>
            )}
            <label className="cursor-pointer rounded-lg border px-3 py-2 text-sm hover:border-primary hover:text-primary">
              {uploadEnCours ? "Envoi..." : "📷 Importer la photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onChoisirPhoto}
                disabled={uploadEnCours}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              required
              placeholder="Nom complet"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="tel"
              required
              placeholder="Téléphone (+243...)"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {erreur && <p className="text-sm text-red-600">{erreur}</p>}

          <button
            type="submit"
            disabled={enregistrement || uploadEnCours}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {enregistrement ? "Enregistrement..." : "+ Enregistrer le livreur"}
          </button>
        </form>

        <h2 className="mb-3 font-semibold">
          Livreurs enregistrés ({livreurs.length})
        </h2>

        {chargement ? (
          <p className="text-sm text-gray-500">Chargement...</p>
        ) : livreurs.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun livreur pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {livreurs.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-xl border bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  {l.photoUrl ? (
                    <img
                      src={l.photoUrl}
                      alt={l.nom}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400">
                      {l.nom.charAt(0)}
                    </div>
                  )}
                  <div>
                    {enEdition === l.id ? (
                      <div className="flex flex-col gap-1">
                        <input
                          value={editNom}
                          onChange={(e) => setEditNom(e.target.value)}
                          className="rounded border px-2 py-1 text-sm"
                        />
                        <input
                          value={editTelephone}
                          onChange={(e) => setEditTelephone(e.target.value)}
                          className="rounded border px-2 py-1 text-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium">{l.nom}</p>
                        <p className="text-xs text-gray-500">{l.telephone}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {enEdition === l.id ? (
                    <button
                      onClick={() => sauvegarderEdition(l.id)}
                      className="text-sm text-primary hover:underline"
                    >
                      Enregistrer
                    </button>
                  ) : (
                    <button
                      onClick={() => ouvrirEdition(l)}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Modifier
                    </button>
                  )}
                  <button
                    onClick={() => supprimer(l.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
