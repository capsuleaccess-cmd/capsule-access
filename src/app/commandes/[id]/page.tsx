import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { lireUtilisateurCourant } from "@/lib/auth";
import ChatCommande from "@/components/ChatCommande";
import ConfirmerReceptionBouton from "@/components/ConfirmerReceptionBouton";

const libellesStatut: Record<string, string> = {
  EN_ATTENTE: "En attente de paiement",
  PAYEE: "Payée",
  CONFIRMEE: "Confirmée — en préparation",
  EN_PREPARATION: "En préparation",
  PRETE: "Prête pour expédition",
  EN_LIVRAISON: "En livraison",
  LIVREE: "Livrée",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
  LITIGE: "Litige en cours",
};

const libellesStatutPaiement: Record<string, string> = {
  EN_ATTENTE_PREUVE: "En attente de paiement",
  EN_ATTENTE_VERIFICATION: "Preuve soumise — vérification en cours",
  BLOQUE_SEQUESTRE: "Fonds sécurisés (séquestre)",
  LIBERE_VENDEUR: "Fonds libérés au vendeur",
  REMBOURSE: "Remboursé",
};

const libellesMethode: Record<string, string> = {
  M_PESA: "M-Pesa",
  ORANGE_MONEY: "Orange Money",
  AIRTEL_MONEY: "Airtel Money",
  ESPECES_LIVRAISON: "Espèces à la livraison",
};

const libellesVille: Record<string, string> = {
  KISANGANI: "Kisangani",
  KINSHASA: "Kinshasa",
  LUBUMBASHI: "Lubumbashi",
};

export default async function CommandeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = lireUtilisateurCourant();
  if (!session) notFound();

  const commande = await prisma.commande.findUnique({
    where: { id: params.id },
    include: {
      lignes: { include: { produit: true } },
      adresse: true,
      evaluation: true,
      litige: true,
      agentLivraison: true,
    },
  });

  if (!commande || commande.acheteurId !== session.id) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 rounded-xl bg-primary/10 p-4 text-primary">
          <p className="font-semibold">Commande {commande.codeCommande}</p>
          <p className="text-sm">Statut : {libellesStatut[commande.statut]}</p>
          {commande.typeLivraison === "EXPEDITION" && (
            <p className="text-sm">
              📦 Expédition vers {libellesVille[commande.villeDestination]}
              {commande.agenceTransport && ` via ${commande.agenceTransport}`}
            </p>
          )}
        </div>

        {commande.statutPaiement === "EN_ATTENTE_PREUVE" ? (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">Paiement non effectué</p>
            <a
              href={`/commandes/${commande.id}/payer`}
              className="mt-2 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Payer maintenant
            </a>
          </div>
        ) : (
          <div className="mb-6 rounded-lg border bg-white p-4 text-sm">
            <p>
              <span className="font-medium">Moyen de paiement :</span>{" "}
              {commande.methodePaiement && libellesMethode[commande.methodePaiement]}
            </p>
            <p className="text-gray-600">
              {libellesStatutPaiement[commande.statutPaiement]}
            </p>
          </div>
        )}

        <p className="mb-6 text-sm text-gray-500">
          Livraison à {commande.adresse.quartier}, {commande.adresse.ville}
        </p>

        {commande.agentLivraison &&
          ["EN_LIVRAISON", "LIVREE", "TERMINEE"].includes(commande.statut) && (
            <div className="mb-6 rounded-xl border bg-white p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Votre livreur désigné
              </p>
              <div className="flex items-center gap-3">
                {commande.agentLivraison.photoUrl ? (
                  <img
                    src={commande.agentLivraison.photoUrl}
                    alt={commande.agentLivraison.nom}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-400">
                    {commande.agentLivraison.nom.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-medium">{commande.agentLivraison.nom}</p>
                  <p className="text-sm text-gray-500">
                    📞 {commande.agentLivraison.telephone}
                  </p>
                </div>
              </div>
              <a
                href={`tel:${commande.agentLivraison.telephone}`}
                className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                📞 Appeler le livreur
              </a>
            </div>
          )}

        {commande.statut === "EN_LIVRAISON" && (
          <ConfirmerReceptionBouton commandeId={commande.id} />
        )}

        <div className="space-y-2 rounded-lg border bg-white p-4 text-sm">
          {commande.lignes.map((l) => (
            <div key={l.id} className="flex justify-between">
              <span>{l.produit.nom} × {l.quantite}</span>
              <span>{(l.prixUnitaire * l.quantite).toFixed(0)} FC</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2 text-gray-600">
            <span>Sous-total</span>
            <span>{commande.totalProduits.toFixed(0)} FC</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Livraison</span>
            <span>{commande.fraisLivraison.toFixed(0)} FC</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-bold">
            <span>Total payé</span>
            <span className="text-primary">{commande.totalPaye.toFixed(0)} FC</span>
          </div>
        </div>

        {commande.typeLivraison === "EXPEDITION" && (
          <ChatCommande commandeId={commande.id} monId={session.id} />
        )}

        {commande.litige ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
            <p className="font-medium text-red-800">Litige ouvert</p>
            <p className="text-red-700">Motif : {commande.litige.motif}</p>
            <p className="text-red-600">
              {commande.litige.decision
                ? `Décision : ${commande.litige.decision}`
                : "Notre équipe examine ta demande."}
            </p>
          </div>
        ) : (
          (commande.statut === "LIVREE" || commande.statut === "TERMINEE") && (
            <div className="mt-6 flex gap-3">
              {!commande.evaluation && (
                <a
                  href={`/commandes/${commande.id}/evaluer`}
                  className="flex-1 rounded-lg bg-primary py-2 text-center text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Évaluer
                </a>
              )}
              <a
                href={`/commandes/${commande.id}/litige`}
                className="flex-1 rounded-lg border py-2 text-center text-sm font-medium hover:border-red-400 hover:text-red-600"
              >
                Signaler un problème
              </a>
            </div>
          )
        )}

        {commande.evaluation && (
          <div className="mt-4 rounded-lg border bg-white p-4 text-sm">
            <p className="font-medium">Ton évaluation : {commande.evaluation.note} / 5</p>
            {commande.evaluation.commentaire && (
              <p className="text-gray-600">{commande.evaluation.commentaire}</p>
            )}
          </div>
        )}

        <a
          href="/"
          className="mt-6 block text-center text-sm text-primary hover:underline"
        >
          Continuer mes achats
        </a>
      </main>
    </>
  );
}
