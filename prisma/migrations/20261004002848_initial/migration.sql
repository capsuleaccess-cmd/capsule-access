-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ACHETEUR', 'VENDEUR', 'ADMIN');

-- CreateEnum
CREATE TYPE "VilleRDC" AS ENUM ('KISANGANI', 'KINSHASA', 'LUBUMBASHI');

-- CreateEnum
CREATE TYPE "TypeLivraison" AS ENUM ('LOCALE', 'EXPEDITION');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('EN_ATTENTE_PREUVE', 'EN_ATTENTE_VERIFICATION', 'BLOQUE_SEQUESTRE', 'LIBERE_VENDEUR', 'REMBOURSE');

-- CreateEnum
CREATE TYPE "StatutCommande" AS ENUM ('EN_ATTENTE', 'PAYEE', 'CONFIRMEE', 'EN_PREPARATION', 'PRETE', 'EN_LIVRAISON', 'LIVREE', 'TERMINEE', 'ANNULEE', 'LITIGE');

-- CreateEnum
CREATE TYPE "StatutLitige" AS ENUM ('OUVERT', 'EN_EXAMEN', 'RESOLU_REMBOURSEMENT', 'RESOLU_REMPLACEMENT', 'RESOLU_AUTRE', 'REJETE');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lien" TEXT,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ACHETEUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Boutique" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "verifiee" BOOLEAN NOT NULL DEFAULT false,
    "ville" "VilleRDC" NOT NULL DEFAULT 'KISANGANI',
    "modeRetraitPaiement" TEXT,
    "numeroRetraitPaiement" TEXT,
    "nomTitulaireCompte" TEXT,
    "proprietaireId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Boutique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentLivraison" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "photoUrl" TEXT,
    "boutiqueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentLivraison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produit" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "prix" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "photos" TEXT[],
    "categorie" TEXT,
    "villeOrigine" "VilleRDC" NOT NULL DEFAULT 'KISANGANI',
    "quantiteExpediable" INTEGER NOT NULL DEFAULT 0,
    "boutiqueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adresse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "quartier" TEXT NOT NULL,
    "details" TEXT,

    CONSTRAINT "Adresse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Panier" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Panier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LignePanier" (
    "id" TEXT NOT NULL,
    "panierId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "LignePanier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Litige" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "description" TEXT,
    "statut" "StatutLitige" NOT NULL DEFAULT 'OUVERT',
    "decision" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Litige_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commande" (
    "id" TEXT NOT NULL,
    "codeCommande" TEXT NOT NULL,
    "acheteurId" TEXT NOT NULL,
    "agentLivraisonId" TEXT,
    "adresseId" TEXT NOT NULL,
    "statut" "StatutCommande" NOT NULL DEFAULT 'EN_ATTENTE',
    "typeLivraison" "TypeLivraison" NOT NULL DEFAULT 'LOCALE',
    "villeDestination" "VilleRDC" NOT NULL,
    "agenceTransport" TEXT,
    "numeroBordereauAgence" TEXT,
    "statutPaiement" "StatutPaiement" NOT NULL DEFAULT 'EN_ATTENTE_PREUVE',
    "preuvePaiementUrl" TEXT,
    "methodePaiement" TEXT,
    "totalProduits" DOUBLE PRECISION NOT NULL,
    "fraisLivraison" DOUBLE PRECISION NOT NULL,
    "totalPaye" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigneCommande" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "LigneCommande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageExpedition" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "expediteurId" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageExpedition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_lu_idx" ON "Notification"("userId", "lu");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Boutique_proprietaireId_key" ON "Boutique"("proprietaireId");

-- CreateIndex
CREATE UNIQUE INDEX "Panier_userId_key" ON "Panier"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LignePanier_panierId_produitId_key" ON "LignePanier"("panierId", "produitId");

-- CreateIndex
CREATE UNIQUE INDEX "Litige_commandeId_key" ON "Litige"("commandeId");

-- CreateIndex
CREATE UNIQUE INDEX "Commande_codeCommande_key" ON "Commande"("codeCommande");

-- CreateIndex
CREATE INDEX "MessageExpedition_commandeId_idx" ON "MessageExpedition"("commandeId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_commandeId_key" ON "Evaluation"("commandeId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boutique" ADD CONSTRAINT "Boutique_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentLivraison" ADD CONSTRAINT "AgentLivraison_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "Boutique"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produit" ADD CONSTRAINT "Produit_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "Boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adresse" ADD CONSTRAINT "Adresse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panier" ADD CONSTRAINT "Panier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LignePanier" ADD CONSTRAINT "LignePanier_panierId_fkey" FOREIGN KEY ("panierId") REFERENCES "Panier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LignePanier" ADD CONSTRAINT "LignePanier_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Litige" ADD CONSTRAINT "Litige_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Litige" ADD CONSTRAINT "Litige_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_acheteurId_fkey" FOREIGN KEY ("acheteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_agentLivraisonId_fkey" FOREIGN KEY ("agentLivraisonId") REFERENCES "AgentLivraison"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_adresseId_fkey" FOREIGN KEY ("adresseId") REFERENCES "Adresse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageExpedition" ADD CONSTRAINT "MessageExpedition_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageExpedition" ADD CONSTRAINT "MessageExpedition_expediteurId_fkey" FOREIGN KEY ("expediteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
