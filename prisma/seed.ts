import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Nettoyage de la base...");
  await prisma.messageExpedition.deleteMany();
  await prisma.litige.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.ligneCommande.deleteMany();
  await prisma.commande.deleteMany();
  await prisma.lignePanier.deleteMany();
  await prisma.panier.deleteMany();
  await prisma.adresse.deleteMany();
  await prisma.agentLivraison.deleteMany();
  await prisma.produit.deleteMany();
  await prisma.boutique.deleteMany();
  await prisma.user.deleteMany();

  const motDePasseHash = await bcrypt.hash("motdepasse123", 10);

  console.log("Création des utilisateurs...");

  const admin = await prisma.user.create({
    data: {
      nom: "Admin Capsule",
      email: "admin@capsule-access.test",
      motDePasseHash,
      role: "ADMIN",
    },
  });

  const vendeur1 = await prisma.user.create({
    data: {
      nom: "Patrick Lokole",
      email: "patrick.vendeur@capsule-access.test",
      motDePasseHash,
      role: "VENDEUR",
    },
  });

  const vendeur2 = await prisma.user.create({
    data: {
      nom: "Chantal Mbayo",
      email: "chantal.vendeur@capsule-access.test",
      motDePasseHash,
      role: "VENDEUR",
    },
  });

  const acheteur = await prisma.user.create({
    data: {
      nom: "Grace Alingi",
      email: "grace.acheteuse@capsule-access.test",
      motDePasseHash,
      role: "ACHETEUR",
    },
  });

  console.log("Création des boutiques (Kisangani et Kinshasa)...");

  const boutique1 = await prisma.boutique.create({
    data: {
      nom: "Électro Kisangani",
      description: "Téléphones, accessoires et électronique à Kisangani.",
      verifiee: true,
      ville: "KISANGANI",
      modeRetraitPaiement: "ORANGE_MONEY",
      numeroRetraitPaiement: "+243812345678",
      nomTitulaireCompte: "Patrick Lokole",
      proprietaireId: vendeur1.id,
    },
  });

  const boutique2 = await prisma.boutique.create({
    data: {
      nom: "Mode Wagenia",
      description: "Vêtements et tissus locaux, expédiés dans toute la RDC.",
      verifiee: false,
      ville: "KINSHASA",
      proprietaireId: vendeur2.id,
    },
  });

  console.log("Création des produits...");

  const produits = await Promise.all([
    prisma.produit.create({
      data: {
        nom: "Chargeur téléphone rapide",
        description: "Chargeur USB-C 25W, compatible la plupart des smartphones.",
        prix: 8.5,
        stock: 40,
        categorie: "Électronique",
        photos: [],
        villeOrigine: "KISANGANI",
        quantiteExpediable: 0,
        boutiqueId: boutique1.id,
      },
    }),
    prisma.produit.create({
      data: {
        nom: "Écouteurs sans fil",
        description: "Autonomie 6h, étui de charge inclus.",
        prix: 15,
        stock: 15,
        categorie: "Électronique",
        photos: [],
        villeOrigine: "KISANGANI",
        quantiteExpediable: 0,
        boutiqueId: boutique1.id,
      },
    }),
    prisma.produit.create({
      data: {
        nom: "Powerbank 10000mAh",
        description: "Batterie externe compacte.",
        prix: 18,
        stock: 0,
        categorie: "Électronique",
        photos: [],
        villeOrigine: "KISANGANI",
        quantiteExpediable: 0,
        boutiqueId: boutique1.id,
      },
    }),
    prisma.produit.create({
      data: {
        nom: "Pagne wax imprimé",
        description: "6 yards, motifs traditionnels. Expédiable dans toute la RDC.",
        prix: 22,
        stock: 25,
        categorie: "Mode",
        photos: [],
        villeOrigine: "KINSHASA",
        quantiteExpediable: 10,
        boutiqueId: boutique2.id,
      },
    }),
    prisma.produit.create({
      data: {
        nom: "Chemise homme brodée",
        description: "Coton, taille M/L/XL disponibles.",
        prix: 14,
        stock: 30,
        categorie: "Mode",
        photos: [],
        villeOrigine: "KINSHASA",
        quantiteExpediable: 5,
        boutiqueId: boutique2.id,
      },
    }),
  ]);

  console.log("Création d'un livreur pour la boutique 1...");

  const livreur = await prisma.agentLivraison.create({
    data: {
      nom: "Serge Bofondo",
      telephone: "+243812000111",
      boutiqueId: boutique1.id,
    },
  });

  console.log("Création des adresses...");

  const adresseKisangani = await prisma.adresse.create({
    data: {
      userId: acheteur.id,
      ville: "Kisangani",
      quartier: "Plateau Boyoma",
      details: "Avenue Bangoka, près du marché central",
    },
  });

  console.log("Commande locale terminée (Kisangani → Kisangani)...");

  const commandeLocale = await prisma.commande.create({
    data: {
      codeCommande: "KIS-000001",
      acheteurId: acheteur.id,
      agentLivraisonId: livreur.id,
      adresseId: adresseKisangani.id,
      statut: "TERMINEE",
      typeLivraison: "LOCALE",
      villeDestination: "KISANGANI",
      statutPaiement: "LIBERE_VENDEUR",
      methodePaiement: "ORANGE_MONEY",
      totalProduits: 8.5 + 15,
      fraisLivraison: 3,
      totalPaye: 8.5 + 15 + 3,
      lignes: {
        create: [
          { produitId: produits[0].id, quantite: 1, prixUnitaire: 8.5 },
          { produitId: produits[1].id, quantite: 1, prixUnitaire: 15 },
        ],
      },
    },
  });

  await prisma.evaluation.create({
    data: {
      commandeId: commandeLocale.id,
      auteurId: acheteur.id,
      note: 5,
      commentaire: "Livraison rapide, produit conforme. Merci !",
    },
  });

  console.log("Commande en expédition inter-villes (Kinshasa → Kisangani)...");

  const commandeExpedition = await prisma.commande.create({
    data: {
      codeCommande: "KIS-000002",
      acheteurId: acheteur.id,
      adresseId: adresseKisangani.id,
      statut: "CONFIRMEE",
      typeLivraison: "EXPEDITION",
      villeDestination: "KISANGANI",
      statutPaiement: "BLOQUE_SEQUESTRE",
      methodePaiement: "M_PESA",
      totalProduits: 22,
      fraisLivraison: 8,
      totalPaye: 30,
      lignes: {
        create: [{ produitId: produits[3].id, quantite: 1, prixUnitaire: 22 }],
      },
    },
  });

  await prisma.messageExpedition.createMany({
    data: [
      {
        commandeId: commandeExpedition.id,
        expediteurId: acheteur.id,
        contenu: "Bonjour, quelle agence utilisez-vous pour Kisangani ?",
      },
      {
        commandeId: commandeExpedition.id,
        expediteurId: vendeur2.id,
        contenu: "Bonjour ! On travaille avec l'agence Classic, départ sous 48h.",
      },
    ],
  });

  console.log("Terminé.");
  console.log("");
  console.log("Comptes de test (mot de passe : motdepasse123) :");
  console.log(`  Admin    : ${admin.email}`);
  console.log(`  Vendeur  : ${vendeur1.email} (Kisangani, boutique vérifiée, 1 livreur : ${livreur.nom})`);
  console.log(`  Vendeur  : ${vendeur2.email} (Kinshasa, boutique non vérifiée, produits expédiables)`);
  console.log(`  Acheteur : ${acheteur.email}`);
  console.log("");
  console.log(`  Commande locale terminée     : ${commandeLocale.codeCommande}`);
  console.log(`  Commande expédition en cours : ${commandeExpedition.codeCommande} (avec messages)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
