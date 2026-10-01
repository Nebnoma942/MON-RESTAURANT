# MON-RESTAURANT — UI/UX Reference V7

Status: Référence validée pour la V7
Date: 2026-10-01
Source: code V7 existant + design system Figma

## Positionnement UX

MON-RESTAURANT est une plateforme locale de commande et de livraison de repas au Burkina Faso.

Principes:
- Mobile-first pour le client et le livreur.
- Action-first: rechercher, choisir, commander, suivre.
- Confiance: statut du restaurant, note, localisation, état de commande et montant visibles.
- Contexte local: FCFA, Ouagadougou, repères de livraison, français simple.
- Chaleureux mais professionnel: orange de marque, surfaces ivoire/blanches, cartes arrondies.
- Lisibilité avant décoration.
- Même langage visuel pour client, restaurant, livreur et administration.

## Audit de l'existant V7

La V7 contient déjà:
- primaire #E85D04
- accent #FF8C42
- fond #FAFAF8
- cartes #FFFFFF
- texte #1A1A1A
- texte secondaire #888880
- succès #16A34A
- avertissement #F59E0B
- danger #DC2626
- typographie Inter
- rayons 12–16 px sur les cartes mobiles
- cartes restaurant avec image, nom, type, note, ville et état ouvert
- cartes plats avec nom, description, prix, promotion et quantité
- navigation client Accueil / Commandes / Fidélité / Profil
- parcours authentification, découverte, détail restaurant, panier, commande, suivi, fidélité et profil

La référence V7 conserve ces éléments et les transforme en système cohérent.

## Architecture

### Client mobile
Accueil, Commandes, Fidélité, Profil.
Écrans de référence: Home, Restaurant Detail, Cart & Checkout, Order Tracking.

### Restaurant
Tableau de bord, Commandes, Menu, Restaurant, Profil / paramètres.
Priorité: commandes actives, préparation, activité, menu.

### Livreur
Mission disponible, mission acceptée, itinéraire / repère, récupération, livraison, confirmation.

### Administration
Vue globale, restaurants à valider, livreurs, commandes, utilisateurs, alertes opérationnelles, analytics.

## Design system

Couleurs:
- brand/primary: #E85D04
- brand/accent: #FF8C42
- surface/background: #FAFAF8
- surface/card: #FFFFFF
- surface/secondary: #FFF3E0
- content/primary: #1A1A1A
- content/muted: #888880
- status/success: #16A34A
- status/warning: #F59E0B
- status/danger: #DC2626

Typographie: Inter
- Display: 32 px Bold
- Heading: 24 px Bold
- Section: 18–20 px Bold
- Body: 16 px Regular
- Label: 14 px Medium
- Caption: 12 px Regular

Espacement: 8 / 16 / 24 / 32 px.
Rayons: 8 / 12 / 16 px; pills 20 px ou plus.

## Composants de référence

Le fichier Figma contient:
- Brand / Logo
- Button / Primary
- Button / Secondary
- Chip / Category
- Card / Restaurant
- Card / Dish Row
- Navigation / Mobile Bottom

## Règles UX

1. Une action primaire dominante par écran.
2. Les montants sont toujours en FCFA.
3. Les statuts utilisent les mêmes couleurs partout.
4. Contenu avant décoration.
5. Recherche et filtres accessibles au pouce.
6. Actions destructives clairement distinguées.
7. Suivi de commande compréhensible sans lecture longue.
8. Le livreur peut agir à une main.
9. Le restaurant voit les commandes avant les analytics.
10. L'administration sépare modération et supervision.

## Référence Figma

https://www.figma.com/design/9MLy24MaJSoZypA2a2xM2c
