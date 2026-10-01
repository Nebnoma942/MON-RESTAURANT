# Vérification V7 — devis de livraison dans le panier

## Objectif
Aligner le prix affiché au client avec le calcul de livraison réalisé par le serveur.

## Modifications
- Le panier client appelle `GET /delivery/quote`.
- Le devis utilise le restaurant, la ville et les coordonnées GPS disponibles.
- La distance et la zone de livraison sont affichées lorsque le serveur les fournit.
- Le bouton de commande est désactivé pendant le calcul du devis.
- Le serveur reste l'autorité finale : lors de la création de la commande, `calculateDeliveryFee()` recalcule le tarif.
- Si le GPS n'est pas disponible, le serveur peut utiliser la zone tarifaire de repli de la ville.

## Sécurité fonctionnelle
Le client ne transmet jamais un montant de livraison comme source de vérité. Le montant final est calculé côté serveur.

## Limites restantes
- Les passerelles Orange Money et Moov Money réelles ne sont pas encore branchées.
- Le GPS en arrière-plan du livreur n'est pas encore implémenté.
- Un test end-to-end complet nécessite l'installation des dépendances et une base PostgreSQL de test.
