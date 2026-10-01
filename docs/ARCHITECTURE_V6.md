# EatBF — Architecture V6

## Objectif
V6 consolide le cycle opérationnel Restaurant → Livreur → Client sans changer l'architecture des quatre applications.

## 1. Parcours de commande
1. Client crée une commande : `pending`.
2. Restaurant accepte : `confirmed`.
3. Restaurant lance la préparation : `preparing`.
4. Restaurant déclare la commande prête : `ready`.
5. Le serveur tente automatiquement d'affecter le livreur disponible le plus proche.
6. Le livreur accepte : assignment `accepted`.
7. Le livreur récupère : assignment `picked_up`, commande `delivering`.
8. Le livreur démarre la livraison : assignment `delivering`.
9. Le livreur confirme la remise : assignment `delivered`, commande `delivered`.

## 2. Résilience de l'affectation
- Si aucun livreur n'est disponible au moment où la commande devient `ready`, la commande reste `ready`.
- Lorsqu'un livreur devient disponible, le serveur retente l'affectation des commandes `ready` récentes.
- Une annulation par un livreur ne supprime pas la commande client : l'affectation revient en file `pending` et une nouvelle affectation est tentée.

## 3. Transitions protégées
Les transitions d'une course ne peuvent plus être sautées arbitrairement :
- `assigned` → `accepted` ou `cancelled`
- `accepted` → `picked_up` ou `cancelled`
- `picked_up` → `delivering` ou `cancelled`
- `delivering` → `delivered` ou `cancelled`
- `delivered` et `cancelled` sont terminaux.

Le restaurant ne contrôle que les états restaurant (`confirmed`, `preparing`, `ready`, `cancelled`).

## 4. Interface restaurant
- Actualisation automatique des commandes toutes les 10 secondes.
- Filtres cohérents avec les états serveur, notamment `Prêtes` et `En livraison`.
- Suppression du bouton imbriqué dans une autre zone cliquable.
- Affichage d'un état spécifique lorsque la commande est prise en charge par un livreur.
- Actualisation automatique de la fiche commande toutes les 10 secondes.

## 5. Client
Le suivi client existant interroge déjà la commande périodiquement. Le statut serveur `delivering` est donc compatible avec la timeline client.

## 6. Plugin / documentation utilisée
La configuration de `refetchInterval` a été vérifiée dans la documentation actuelle TanStack Query via Context7. Le polling en millisecondes est supporté par les options de requête.

## 7. Ce qui reste à faire
- afficher au client le livreur affecté et/ou son ETA lorsque les règles de confidentialité le permettent ;
- connecter réellement Orange Money et Moov Money à un prestataire local ;
- utiliser le devis de livraison dynamique directement dans l'interface panier avant validation ;
- notifications push/SMS ;
- tests d'intégration avec PostgreSQL et plusieurs livreurs concurrents ;
- GPS en arrière-plan côté livreur selon les permissions mobiles.
