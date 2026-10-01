# EatBF — Architecture V3

## Applications

1. `artifacts/mobile` — application Client (Expo/React Native)
2. `artifacts/restaurant-app` — application Restaurant (React/Vite)
3. `artifacts/driver-app` — application Livreur (Expo/React Native)
4. `artifacts/admin` — application Administration (React/Vite)

Toutes les applications consomment le backend commun `artifacts/api-server`.

## Backend partagé

- Express + TypeScript
- PostgreSQL + Drizzle ORM
- JWT pour l'authentification
- rôles : `client`, `restaurant_owner`, `driver`, `admin`
- commandes avec client authentifié ou invité
- suivi par `trackingToken`
- zones et calcul des frais de livraison
- livreurs, disponibilité, GPS et affectations
- fidélité

## Flux cible

Client -> panier -> adresse/GPS -> devis livraison -> commande -> validation restaurant -> préparation -> attribution livreur -> récupération -> livraison -> paiement confirmé -> fidélité/avis.

Restaurant -> reçoit -> accepte/prépare -> prêt -> remet au livreur.

Livreur -> disponible -> reçoit course -> accepte -> récupère -> livre -> confirme.

Admin -> supervise restaurants, commandes, zones, livreurs, paiements et paramètres.

## Règle de développement

Le ZIP source fourni par l'utilisateur est désormais la base de référence. Replit n'est plus une dépendance nécessaire.
