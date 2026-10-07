"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";

type Utilisateur = {
  id: string;
  nom: string;
  email: string;
  role: string;
  createdAt: string;
};

const libellesRole: Record<string, string> = {
  ACHETEUR: "Acheteur",
  VENDEUR: "Vendeur",
  ADMIN: "Admin",
};

export default function AdminUtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function charger() {
      const res = await fetch("/api/admin/utilisateurs");
      if (res.ok) {
        setUtilisateurs(await res.json());
      } else {
        const data = await res.json();
        setErreur(data.erreur || "Erreur de chargement.");
      }
      setChargement(false);
    }
    charger();
  }, []);

  if (erreur) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <p className="text-sm text-red-600">{erreur}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Utilisateurs</h1>

        {chargement ? (
          <p className="text-sm text-gray-500">Chargement...</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Rôle</th>
                  <th className="px-4 py-2">Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="px-4 py-2">{u.nom}</td>
                    <td className="px-4 py-2 text-gray-500">{u.email}</td>
                    <td className="px-4 py-2">{libellesRole[u.role]}</td>
                    <td className="px-4 py-2 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
