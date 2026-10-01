# Développement — EatBF

## Version 4

Le projet comporte quatre applications : Client, Restaurant, Livreur et Admin, partageant un backend Express/PostgreSQL.

### Livreur
- Authentification dédiée avec rôle `driver`.
- Création automatique du profil livreur à l'inscription.
- Mise en ligne/hors ligne et disponibilité.
- Position GPS envoyée au backend en premier plan pendant la disponibilité.
- Consultation des courses affectées.
- Transitions `assigned -> accepted -> picked_up -> delivering -> delivered`.
- Réactivation automatique de la disponibilité après livraison/annulation.

### Dispatch
L'affectation d'un livreur réserve désormais atomiquement sa disponibilité afin d'éviter qu'une même course ou deux dispatchs concurrents ne prennent le même livreur.

### Limite actuelle
Le suivi GPS en arrière-plan complet n'est pas encore activé. Il sera ajouté après validation du flux foreground, avec les permissions Android/iOS appropriées.
