# Audit fonctionnel V7 — MON-RESTAURANT

Date: 2026-10-01

## Parcours audité

Client → restaurant → commande → paiement → préparation → chauffeur → livraison → fidélité.

## Résultats

| Domaine | Vérification | Correction |
|---|---|---|
| Client / commande | restaurant approuvé, plats disponibles, prix serveur, quantités bornées | Oui |
| Panier / total | sous-total et frais recalculés côté serveur | Oui, conservé |
| Paiement | Orange Money / Moov Money ne peuvent plus passer en préparation sans paiement confirmé | Oui |
| Paiement cash | paiement reste en attente jusqu'à la livraison puis devient payé | Oui |
| Restaurant | seul propriétaire/admin peut gérer restaurant et menu | Oui |
| Préparation | transitions pending → confirmed → preparing → ready | Oui |
| Dispatch | création d'une affectation et recherche d'un chauffeur disponible | Oui |
| Chauffeur | assigned → accepted → picked_up → delivering → delivered | Oui |
| Chauffeur indisponible | les commandes ready restent dispatchables et peuvent être réessayées | Oui |
| Chauffeur | disponibilité cohérente avec online | Oui |
| Livraison | finalisation centralisée et idempotente | Oui |
| Fidélité | points crédités à la livraison, une seule fois | Oui |
| Réduction fidélité | réservation atomique des points, historique lié à la commande | Oui |
| Annulation | remboursement des points de réduction réservés | Oui |
| Adresses | suppression limitée au propriétaire et un seul défaut | Oui |
| Contrat API | endpoint de vérification de paiement ajouté à OpenAPI | Oui |

## Règles métier désormais garanties

1. Une commande mobile-money ne peut pas être acceptée/préparée tant que son paiement n'est pas "paid".
2. Une commande cash est considérée payée au moment de la livraison.
3. La livraison crédite les points fidélité via un seul service métier, y compris quand la livraison est finalisée par le chauffeur.
4. Une réduction fidélité consomme 15 points atomiquement et son écriture comptable est attachée à la commande.
5. Une annulation restitue les 15 points réservés.
6. Les transitions de commande sont contrôlées côté serveur et sont idempotentes lorsqu'un même statut est renvoyé.
7. Un chauffeur ne peut plus annuler une course après "picked_up" ou "delivering", ce qui évite une réaffectation incohérente d'une commande déjà récupérée.
8. Un chauffeur ne peut être disponible que s'il est en ligne.
9. La gestion d'un menu est limitée au propriétaire du restaurant ou à l'administrateur.
10. Les adresses d'un client ne peuvent être supprimées que par ce client.

## Paiement réel

La V7 ne contient pas encore de connecteur bancaire/opérateur exécutant réellement un débit Orange Money ou Moov Money. Le parcours est donc volontairement modélisé en **vérification restaurant** : le client effectue le paiement selon les instructions affichées, puis le restaurant confirme "paid" ou "failed".

Cette séparation est importante : l'application ne prétend plus qu'un bouton client « j'ai payé » constitue une preuve de paiement.

Pour la production, il faudra brancher les APIs/partenaires de paiement avec leurs credentials, callbacks/webhooks et mécanismes de rapprochement. Le modèle "paymentStatus" est déjà compatible avec cette évolution.

## Validation

Les modifications ont été poussées directement dans main. Le workflow GitHub Actions "V7 technical validation" est déclenché sur le dernier commit et exécute le typecheck puis le build du workspace.
