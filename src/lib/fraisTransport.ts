export type LigneFrais = {
  quantite: number;
  produit: {
    nom: string;
    boutiqueId: string;
    villeOrigine: string;
    fraisTransport: number | null;
    fraisExpedition: number | null;
  };
};

export type ResultatFrais =
  | {
      ok: true;
      total: number;
      parBoutique: Record<string, number>;
      typeLivraison: "LOCALE" | "EXPEDITION";
    }
  | { ok: false; erreur: string };

// Regles : les frais ne sont jamais multipli\u00e9s par la quantit\u00e9 ; au sein
// d'une m\u00eame boutique on retient le montant le plus \u00e9lev\u00e9 ; les boutiques
// diff\u00e9rentes s'additionnent ; un montant non configur\u00e9 bloque la commande.
export function calculerFraisLivraison(
  lignes: LigneFrais[],
  villeDestination: string
): ResultatFrais {
  const parBoutique: Record<string, number> = {};
  let typeLivraison: "LOCALE" | "EXPEDITION" = "LOCALE";

  for (const ligne of lignes) {
    const produit = ligne.produit;
    const expedition = produit.villeOrigine !== villeDestination;
    if (expedition) typeLivraison = "EXPEDITION";

    const frais = expedition ? produit.fraisExpedition : produit.fraisTransport;
    if (frais === null || frais === undefined) {
      return {
        ok: false,
        erreur: expedition
          ? 'Le vendeur de "' + produit.nom + '" n\'a pas encore fix\u00e9 ses frais d\'exp\u00e9dition vers cette ville. Commande impossible pour le moment.'
          : 'Le vendeur de "' + produit.nom + '" n\'a pas encore fix\u00e9 ses frais de livraison. Commande impossible pour le moment.',
      };
    }

    parBoutique[produit.boutiqueId] = Math.max(
      parBoutique[produit.boutiqueId] ?? 0,
      frais
    );
  }

  const total = Object.values(parBoutique).reduce((somme, f) => somme + f, 0);
  return { ok: true, total, parBoutique, typeLivraison };
}