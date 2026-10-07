"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { MOBILE_MONEY_PLATEFORME } from "@/lib/config";

const methodesMobileMoney = [
  { id: "M_PESA", label: "M-Pesa", numero: MOBILE_MONEY_PLATEFORME.M_PESA },
  { id: "ORANGE_MONEY", label: "Orange Money", numero: MOBILE_MONEY_PLATEFORME.ORANGE_MONEY },
  { id: "AIRTEL_MONEY", label: "Airtel Money", numero: MOBILE_MONEY_PLATEFORME.AIRTEL_MONEY },
];

export default function PayerCommandePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [methode, setMethode] = useState("M_PESA");
  const [espece, setEspece] = useState(false);
  const [preuveUrl, setPreuveUrl] = useState("");
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const methodeActuelle = methodesMobileMoney.find((m) => m.id === methode);

  async function onChoisirPreuve(e: React.ChangeEvent<HTMLInputElement>) {
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
    setPreuveUrl(url);
  }

  async function onConfirmer() {
    setErreur("");

    if (!espece && !preuveUrl) {
      setErreur("Merci de joindre la capture d'écran de ta transaction.");
      return;
    }

    setChargement(true);

    const res = await fetch(`/api/commandes/${params.id}/preuve-paiement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        methodePaiement: espece ? "ESPECES_LIVRAISON" : methode,
        preuvePaiementUrl: espece ? undefined : preuveUrl,
      }),
    });

    setChargement(false);

    if (!res.ok) {
      const data = await res.json();
      setErreur(data.erreur || "Une erreur est survenue.");
      return;
    }

    router.push(`/commandes/${params.id}`);
    router.refresh();
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="mb-2 text-2xl font-bold">Paiement</h1>
        <p className="mb-6 text-sm text-gray-600">
          Envoie ton paiement au numéro Mobile Money de Capsule Access, puis
          soumets la capture d'écran de la transaction. Tes fonds restent
          protégés (séquestre) jusqu'à confirmation de la réception.
        </p>

        <div className="mb-4 flex gap-2">
          {methodesMobileMoney.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMethode(m.id);
                setEspece(false);
              }}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                !espece && methode === m.id
                  ? "border-primary bg-primary/5 text-primary"
                  : ""
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {!espece && methodeActuelle && (
          <div className="mb-4 rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500">
              Envoie le montant exact au numéro {methodeActuelle.label} suivant :
            </p>
            <p className="mt-1 text-lg font-bold text-primary">
              {methodeActuelle.numero}
            </p>
            <p className="mt-1 text-xs text-gray-400">Capsule Access</p>

            <label className="mt-4 flex h-32 cursor-pointer items-center justify-center rounded-lg border border-dashed text-sm text-gray-500 hover:border-primary hover:text-primary">
              {uploadEnCours
                ? "Envoi..."
                : preuveUrl
                ? "✓ Preuve jointe — cliquer pour remplacer"
                : "📷 Joindre la capture d'écran / le reçu"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onChoisirPreuve}
                disabled={uploadEnCours}
                className="hidden"
              />
            </label>
            {preuveUrl && (
              <img src={preuveUrl} alt="Preuve" className="mt-2 max-h-40 rounded-lg" />
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setEspece(!espece)}
          className={`mb-4 w-full rounded-lg border py-2 text-sm font-medium ${
            espece ? "border-primary bg-primary/5 text-primary" : ""
          }`}
        >
          Payer en espèces à la livraison
        </button>

        {erreur && <p className="mb-4 text-sm text-red-600">{erreur}</p>}

        <button
          onClick={onConfirmer}
          disabled={chargement || uploadEnCours}
          className="w-full rounded-lg bg-primary py-3 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {chargement ? "Envoi..." : "Confirmer le paiement"}
        </button>
      </main>
    </>
  );
}
