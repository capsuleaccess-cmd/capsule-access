// Constantes économiques du MVP Kisangani — à ajuster selon les coûts réels.
export const COMMISSION_TAUX = 0.05; // 5% sur les ventes
export const FRAIS_LIVRAISON_LOCALE = 3000; // $ fixe, livraison même ville
export const FRAIS_EXPEDITION_INTERVILLES = 8000; // $ fixe, à affiner par agence/poids

// Coordonnées Mobile Money officielles de la plateforme, où les clients
// envoient leur paiement avant de soumettre leur preuve (séquestre).
export const MOBILE_MONEY_PLATEFORME = {
  M_PESA: "+243 810 000 001",
  ORANGE_MONEY: "+243 820 000 001",
  AIRTEL_MONEY: "+243 990 000 001",
};

export const VILLES: { valeur: string; label: string }[] = [
  { valeur: "KISANGANI", label: "Kisangani" },
  { valeur: "KINSHASA", label: "Kinshasa" },
  { valeur: "LUBUMBASHI", label: "Lubumbashi" },
];
