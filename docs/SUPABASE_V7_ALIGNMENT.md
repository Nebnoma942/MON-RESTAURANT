# Alignement V7 ↔ Supabase

Audit et alignement réalisés le 1er octobre 2026.

## Architecture retenue

La V7 conserve son backend Express et son ORM Drizzle. Supabase devient l'instance PostgreSQL de référence via DATABASE_URL. Les applications Client, Restaurant, Livreur et Admin passent par l'API Express et ne lisent pas directement les tables métier via le Data API Supabase.

L'authentification V7 reste actuellement bcrypt + JWT dans l'API Express. Aucune intégration @supabase/supabase-js n'est requise pour le fonctionnement actuel de la V7.

## Correspondance vérifiée

Le contrat V7 contient neuf tables: users, restaurants, dishes, orders, addresses, loyalty_history, drivers, delivery_assignments et delivery_zones. Le projet Supabase MON RESTAURANT TEST (ref modhavicbacqgfodsxxv) contient désormais exactement ces tables avec les colonnes, types, clés et contraintes correspondant aux schémas Drizzle V7.

RLS est activé sur les neuf tables. Les advisors Supabase sécurité et performance ne signalent aucun problème après migration.

La migration appliquée est v7_core_schema_alignment, version 20261001072622. Elle est aussi versionnée dans GitHub sous supabase/migrations/20261001000000_v7_core_schema.sql.

## Test de cohérence

Une insertion transactionnelle de contrôle sur users a réussi puis a été annulée (ROLLBACK), confirmant que PostgreSQL accepte le contrat de données et les séquences de la V7.

## Point restant pour le déploiement

La correspondance code ↔ base est maintenant établie. Pour une exécution réelle, l'environnement qui lance l'API V7 doit recevoir DATABASE_URL avec la chaîne de connexion du projet Supabase. Cette valeur reste un secret d'environnement et ne doit jamais être commitée. La clé service_role ne doit jamais être exposée dans un client public.
