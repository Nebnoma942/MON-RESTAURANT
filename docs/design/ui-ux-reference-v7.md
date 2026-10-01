# MON-RESTAURANT — Référence UI/UX V7

## Statut
Référence UI/UX établie à partir de l'état réel du dépôt GitHub `Nebnoma942/MON-RESTAURANT` sur `main`, avec une formalisation Figma.

**Figma :** https://www.figma.com/design/Kh8tjEMqsnPbCJScocOwWe

## Sources V7 examinées

- `artifacts/restaurant-app/src/index.css` — langage visuel mobile restaurant, thème chaud orange, Inter, rayons et ombres.
- `artifacts/restaurant-app/src/App.tsx` — navigation Dashboard / Orders / Menu / Profile / Setup, avec BottomNav.
- `artifacts/admin/src/index.css` — tokens UI, composants Tailwind/Radix et thème admin.
- `artifacts/admin/src/App.tsx` — Login, Dashboard, Restaurants, Users, Orders et AdminLayout.
- `artifacts/mobile/package.json` — Expo/React Native, Inter, navigation mobile et capacités appareil.
- `artifacts/driver-app/package.json` — Expo/React Native pour le parcours livreur.
- `artifacts/mockup-sandbox` — infrastructure de prévisualisation de composants.

## Constats de réconciliation

La V7 contient déjà plusieurs fondations UI solides, mais elles n'étaient pas encore regroupées en une référence commune. Le principal écart est la présence de deux accents visuels distincts : l'application restaurant utilise un orange chaud (`#E85D04`) tandis que l'admin utilise actuellement un violet comme primaire.

Pour la référence MON-RESTAURANT, le langage orange chaud de `restaurant-app` est conservé comme **token de marque/action partagé**. L'admin reste plus dense et plus orienté données, mais réutilise les mêmes tokens de marque, surfaces, texte et statuts.

## Direction UI/UX V7

### 1. Identité visuelle
- Orange de marque/action : **#E85D04**
- Orange foncé pour les états/hover : **#C84D00**
- Orange doux : **#FFF0E6**
- Fond principal chaud : **#FAF8F6**
- Surface : **#FFFFFF**
- Texte principal : **#231F1C**
- Texte secondaire : **#6B625C**
- Bordure : **#E6DED6**

### 2. Typographie
**Inter** est la famille de référence pour les interfaces web et mobiles.

Échelle de référence :
- Display/Hero — 32/38 Bold
- H1 — 28/34 Bold
- H2 — 22/28 Semi Bold
- H3 — 18/24 Semi Bold
- Body Large — 17/25 Regular
- Body Medium — 15/22 Regular
- Body Small — 13/19 Regular
- Label Medium — 13/18 Medium
- Label Small — 11/16 Medium

### 3. Espacement et formes
Échelle de base : **4 px**.

Valeurs : 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 px.

Rayons : 6 / 10 / 16 / 24 / 999 px.

Les cartes et surfaces doivent rester simples, avec une élévation légère plutôt que des bordures lourdes.

### 4. Navigation

**Client mobile**
- Navigation basse persistante.
- Priorité : Accueil, Explorer, Commandes, Profil.
- Actions principales visibles sans surcharge.

**Restaurant**
- Navigation basse pour les usages opérationnels fréquents : Accueil, Commandes, Menu, Profil.
- Les commandes et leur statut sont prioritaires.

**Admin**
- Sidebar verticale.
- Dashboard, Restaurants, Utilisateurs, Commandes, Paramètres.
- Densité d'information supérieure à celle du mobile.

### 5. Statuts
Les statuts ne doivent jamais être communiqués uniquement par la couleur.

- Success : #16A34A
- Warning : #D97706
- Danger : #DC2626
- Info : #2563EB

Toujours associer couleur + libellé et, lorsque pertinent, une icône.

## Inventaire des composants de référence

### Fondations
Button, Input, Card, Badge, Tabs, Dialog/Sheet, Toast, Tooltip, EmptyState.

### Métier MON-RESTAURANT
RestaurantCard, MenuItem, OrderStatus, OrderSummary, OrderRow, KPI, BottomNav, AdminSidebar.

### Principes d'usage
- Une action primaire dominante par section.
- Les cartes servent à regrouper des informations liées.
- Les états de commande restent immédiatement lisibles.
- Les interfaces opérationnelles privilégient la vitesse de lecture et l'action.
- Les écrans client privilégient découverte, choix et commande.
- Les écrans admin privilégient supervision, filtrage et données.

## Responsive

### Mobile
Référence : 360–430 px de largeur utile.
- Bottom navigation.
- Contenu à une colonne.
- Touch targets confortables.
- Cartes empilées.

### Tablet
- Deux colonnes lorsque le contenu le justifie.
- Navigation pouvant évoluer vers une barre latérale compacte.

### Desktop
- Admin : sidebar + zone de contenu.
- Restaurant : contenu centré avec densité modérée.
- Client web éventuel : grille de restaurants/plats.

## Motion
- Transitions courtes : environ 150–220 ms.
- Motion fonctionnelle : ouverture de Sheet/Dialog, navigation, changement d'état.
- Éviter la motion décorative dans les écrans opérationnels.

## Accessibilité
- Contraste suffisant entre texte et surface.
- Ne jamais dépendre uniquement de la couleur pour un état.
- Labels explicites.
- États focus/pressed/disabled prévus dans les composants.
- Cibles tactiles adaptées aux usages mobiles.

## Figma

Le fichier de référence contient trois pages, adaptées à la limite du plan Figma actuellement utilisé :

1. **00 — Overview** — principes et décisions de référence.
2. **01 — Design System** — tokens, typographie et composants principaux.
3. **02 — Screens** — compositions représentatives Client, Restaurant et Admin.

Collections de variables :
- `MON Primitives`
- `MON Color`
- `MON Spacing`

Le mode Figma est actuellement unique (`Value`) en raison de la limite du plan Starter. Le support Light/Dark pourra être étendu lorsque le plan Figma le permettra ou être géré côté code.

## Règle pour la suite de la V7

Toute nouvelle interface doit partir de cette référence avant d'introduire une nouvelle couleur, un nouveau rayon, une nouvelle échelle typographique ou un nouveau pattern de navigation.

Les différences entre Client / Restaurant / Livreur / Admin doivent venir principalement du **contexte et de la densité fonctionnelle**, pas de quatre identités graphiques indépendantes.
