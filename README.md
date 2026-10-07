# Capsule Access

Marketplace e-commerce multi-villes RDC — Kisangani, Kinshasa, Lubumbashi →
Afrique → International.

## Démarrage

1. Installer les dépendances :
   ```
   npm install
   ```
2. Copier `.env.example` en `.env` et renseigner `DATABASE_URL` (PostgreSQL).
3. Générer le client Prisma et créer les tables :
   ```
   npm run prisma:generate
   npm run prisma:migrate
   ```
4. (Optionnel mais recommandé) Remplir la base avec des données de test :
   ```
   npm run prisma:seed
   ```
   Crée 4 comptes (admin, 2 vendeurs — un à Kisangani, un à Kinshasa —, 1
   acheteur ; mot de passe `motdepasse123`), un livreur rattaché à la boutique
   de Kisangani, 5 produits (dont 2 expédiables inter-villes), une commande
   locale terminée avec évaluation, et une commande en expédition inter-villes
   avec des messages de négociation déjà échangés.
5. Lancer le serveur de développement :
   ```
   npm run dev
   ```
6. Ouvrir http://localhost:3000

## État actuel

- [x] Structure du projet (Next.js + TypeScript + Tailwind)
- [x] Schéma de base de données (Prisma)
- [x] Page d'accueil (filtrage par ville, catégories, grille produits)
- [x] Comptes utilisateurs (inscription / connexion, mot de passe hashé, session JWT en cookie)
- [x] Boutiques (création côté vendeur, ville, coordonnées de retrait Mobile Money)
- [x] Produits (ajout côté vendeur avec photos, ville d'origine, quantité expédiable)
- [x] Panier (persistant en base, ajout depuis la fiche produit, gestion des quantités)
- [x] Commandes multi-villes (ville de destination, détection auto locale/expédition)
- [x] Paiement par séquestre avec preuve Mobile Money (voir note ci-dessous)
- [x] Livraison locale (flotte de livreurs gérée par chaque vendeur)
- [x] Expédition inter-villes (agence de transport, chat de négociation)
- [x] Évaluations / litiges (note 1-5 + commentaire ; signalement avec motif)
- [x] Dashboard vendeur (revenu net après commission, commandes, stock, note moyenne)
- [x] Dashboard administrateur (stats globales, vérification boutiques, paiements, litiges, utilisateurs)
- [x] Recherche produit + filtrage par ville
- [x] Notifications (cloche dans le header, événements sur tout le parcours)

## Paiement par séquestre — comment ça marche

Il n'y a pas d'intégration API Mobile Money réelle (M-Pesa / Orange Money /
Airtel Money n'exposent pas d'API ouverte facilement accessible pour un MVP).
Le flux repris à la place :

1. Le client envoie son paiement au numéro Mobile Money **de la plateforme**
   (affiché sur `/commandes/[id]/payer`, configuré dans `src/lib/config.ts`
   → `MOBILE_MONEY_PLATEFORME`).
2. Il soumet une capture d'écran de la transaction (`statutPaiement` passe à
   `EN_ATTENTE_VERIFICATION`).
3. Un admin vérifie la preuve sur `/admin/paiements` et valide ou rejette.
   Une fois validée, `statutPaiement` passe à `BLOQUE_SEQUESTRE` — les fonds
   sont considérés sécurisés et le vendeur peut préparer/expédier.
4. Une fois la commande livrée, **le client confirme la réception**
   (bouton sur `/commandes/[id]` quand le statut est `EN_LIVRAISON`) :
   `statutPaiement` passe à `LIBERE_VENDEUR`, le vendeur est notifié avec ses
   coordonnées de retrait.

L'option "Espèces à la livraison" existe aussi et saute l'étape de preuve
(les fonds sont considérés disponibles dès la confirmation de commande,
puisqu'il n'y a rien à séquestrer).

Pour brancher une vraie API Mobile Money plus tard, le point d'entrée est
`src/app/api/commandes/[id]/preuve-paiement/route.ts` — remplacer la
vérification manuelle par un appel/webhook fournisseur.

## Multi-villes & expédition inter-villes

- Chaque **boutique** a une ville (Kisangani, Kinshasa ou Lubumbashi) et
  chaque **produit** hérite de la ville de sa boutique comme `villeOrigine`,
  avec une `quantiteExpediable` optionnelle (0 = vente locale uniquement).
- À la commande, le client choisit sa **ville de destination**. Si elle
  diffère de la ville d'origine d'au moins un produit du panier, la commande
  passe automatiquement en `typeLivraison: EXPEDITION` (frais différents,
  voir `src/lib/config.ts`).
- Pour une commande en expédition, un **chat** (`MessageExpedition`) s'ouvre
  entre l'acheteur et le vendeur pour convenir de l'agence de transport —
  visible sur `/commandes/[id]` côté client et `/vendeur/commandes/[id]/chat`
  côté vendeur. Limite actuelle : ce chat est rattaché à une commande déjà
  créée (le modèle de données l'exige) — il n'y a pas encore de discussion
  possible directement depuis la fiche produit avant de commander.
- Le vendeur peut renseigner le nom de l'agence et le numéro de bordereau
  (`agenceTransport`, `numeroBordereauAgence` sur `Commande`) — ces champs
  existent dans le schéma mais n'ont pas encore d'interface dédiée ; à
  ajouter à `/vendeur/commandes` si besoin.

## Livraison locale — comment ça marche

Il n'y a **pas de compte utilisateur livreur**. Chaque vendeur gère sa propre
flotte de livreurs (nom, téléphone, photo) dans `/vendeur/livreurs`. Quand une
commande est prête (`/vendeur/commandes`), le vendeur choisit un livreur de sa
flotte et l'expédie ; le client voit la photo, le nom et le téléphone du
livreur sur `/commandes/[id]` avec un bouton d'appel direct. C'est le client
qui confirme ensuite la réception (voir séquestre ci-dessus), pas le vendeur.

## Rôle ADMIN

L'inscription publique ne permet de créer que des comptes **ACHETEUR** ou
**VENDEUR**. Pour tester l'admin (`/admin/dashboard`, `/admin/paiements`,
`/admin/boutiques`, `/admin/litiges`, `/admin/utilisateurs`), il faut changer
le rôle manuellement en base (Prisma Studio : `npm run prisma:studio`, table
`User`, champ `role` → `ADMIN`). Le script de seed crée déjà un compte admin.

## Photos produits — état actuel

L'upload (`/api/upload`) stocke l'image en **base64 directement en base de
données** (limite 2 Mo/image, 3 photos/produit) — suffisant pour tester, mais
alourdit la base à l'échelle. Pour un vrai stockage cloud (Cloudinary, S3,
Backblaze...), remplacer le corps de `src/app/api/upload/route.ts` par l'appel
au fournisseur et retourner son URL publique à la place du data URI.

## À faire ensuite (non bloquant)

- Interface pour que le vendeur renseigne l'agence de transport et le numéro
  de bordereau lors de l'expédition (champs déjà en base)
- Discussion pré-commande depuis la fiche produit (nécessiterait de découpler
  `MessageExpedition` d'une commande, ou une entité de discussion séparée)
- Vraie intégration API Mobile Money (voir section séquestre)
