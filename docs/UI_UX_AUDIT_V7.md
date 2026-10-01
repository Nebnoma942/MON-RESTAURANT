# Audit UI/UX V7 — résultat et corrections

Date : 2026-10-01

La référence UI/UX V7 déjà présente dans `docs/UI_UX_REFERENCE_V7.md` reste la source de vérité. L'audit porte sur les surfaces réellement livrées dans le dépôt : Client mobile, Restaurateur, Livreur et Administration.

## Écarts constatés

- L'administration utilisait encore une dominante violette alors que la référence V7 fixe l'orange `#E85D04` comme primaire.
- Les rayons, densités et cibles tactiles n'étaient pas homogènes entre les surfaces.
- L'administration utilisait une sidebar fixe de 256 px sans navigation mobile dédiée.
- L'espace livreur reposait encore largement sur les contrôles React Native natifs, avec une hiérarchie visuelle faible et des états de course peu structurés.
- La palette mobile n'exposait pas de véritable jeu de tokens sombre malgré un hook capable de basculer de palette.
- Les métadonnées web contenaient encore le texte générique Replit et `lang="en"`.
- L'application restaurateur restait contrainte à `max-w-lg` même sur desktop.
- Les focus clavier et la sélection visuelle n'étaient pas explicitement harmonisés sur les applications web.

## Corrections appliquées

- Administration réalignée sur la palette chaude de référence et suppression de la dominante violette.
- Administration rendue responsive avec une navigation compacte mobile et des cibles tactiles plus grandes.
- Navigation restaurateur renforcée et conteneur desktop élargi sans perdre la logique mobile-first.
- Espace livreur refondu autour de cartes, états sémantiques, actions explicites, GPS et disponibilité, avec la même grammaire orange/ivoire.
- Palette client mobile complétée par des tokens light/dark cohérents avec la référence.
- Panier flottant et navigation mobile ajustés pour les zones tactiles et l'espace bas d'écran.
- Métadonnées HTML francisées et nettoyées.
- Focus clavier et sélection ajoutés aux surfaces web.

## Contrôle de cohérence

- [x] Couleur primaire commune : `#E85D04`
- [x] Accent commun : `#FF8C42`
- [x] Fonds chauds et surfaces blanches
- [x] Inter comme typographie web/mobile déjà utilisée par la V7
- [x] États succès / avertissement / information / erreur
- [x] Navigation mobile utilisable
- [x] Administration responsive
- [x] Surface livreur alignée sur la référence
- [x] Métadonnées françaises
- [x] Documentation de l'audit versionnée

## Validation technique

Les modifications ont été contrôlées statiquement. Le compilateur TypeScript global confirme l'absence d'erreur de parsing sur les fichiers modifiés ; les erreurs restantes lors de cette vérification locale sont uniquement des résolutions de dépendances, l'environnement d'audit ne contenant pas les `node_modules` de la V7.

La validation de compilation intégrale reste assurée par le workflow V7 du dépôt après les commits.
