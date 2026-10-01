# Vérification V5

## Contrôles effectués
- Inspection des sources V4 avant modification.
- Vérification des transitions de commande et séparation restaurant/livraison.
- Ajout du dispatch automatique à l'état `ready`.
- Ajout du checkout invité sans création automatique de compte.
- Ajout de la transmission GPS quand la permission est accordée.
- Ajout du paiement à la livraison comme méthode de commande.
- Mise à jour de la spécification OpenAPI et des types générés utilisés par le client.

## Limitation de cet environnement
Les dépendances Node/Expo ne sont pas installées dans l'environnement de travail de cette session (`pnpm` n'est pas disponible). Un `tsc` global ne peut donc pas valider le projet, car les modules et types du workspace sont absents.

Avant une mise en production, installer les dépendances avec le gestionnaire de paquets prévu par le projet puis exécuter les typechecks/builds de chaque workspace.
