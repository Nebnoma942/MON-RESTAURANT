# Alignement V7 ↔ Supabase

L'audit du 1er octobre 2026 a établi que la V7 utilise Drizzle + PostgreSQL via DATABASE_URL et ne contient aucune intégration Supabase côté client. L'authentification est actuellement bcrypt + JWT dans l'API Express.

La décision retenue est de conserver Express/Drizzle comme couche métier et de faire de Supabase l'instance PostgreSQL de référence. Les quatre applications passent par l'API Express; elles ne lisent pas directement les tables métier via le Data API Supabase.

Le fichier supabase/migrations/20261001000000_v7_core_schema.sql formalise le contrat de données V7: users, restaurants, dishes, orders, addresses, loyalty_history, drivers, delivery_assignments et delivery_zones, avec leurs relations, contraintes et RLS.

La vraie DATABASE_URL reste un secret d'environnement et ne doit jamais être commitée. L'application ne doit pas utiliser la clé service_role dans un client public.

Le projet Supabase MON RESTAURANT TEST a été réveillé pour permettre l'audit. Au moment de la vérification, il était encore en état COMING_UP et son PostgreSQL refusait encore les connexions; l'application de la migration et l'introspection finale restent donc à exécuter dès que la base est disponible.