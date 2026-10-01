# MON-RESTAURANT — Design Tokens V7

Ces tokens reprennent les valeurs déjà présentes dans la V7 et les normalisent pour Figma et l'application.

## Couleurs

brand/primary       #E85D04
brand/accent        #FF8C42
surface/background  #FAFAF8
surface/card        #FFFFFF
surface/secondary   #FFF3E0
content/primary     #1A1A1A
content/muted       #888880
status/success      #16A34A
status/warning      #F59E0B
status/danger       #DC2626

## Espacement

space/sm = 8
space/md = 16
space/lg = 24
space/xl = 32

## Rayons

radius/sm = 8
radius/md = 12
radius/lg = 16
pill = 20+

## Typographie

Inter / Regular, Medium, Semi Bold, Bold.

## Ombres

Ombres très faibles. La séparation d'une carte vient d'abord du contraste de surface et de la bordure.

## Responsive

Mobile:
- largeur de référence client: 390 px
- padding horizontal courant: 16 px
- CTA pleine largeur dans les étapes transactionnelles

Desktop:
- conteneurs larges
- grilles de KPI
- panneaux persistants
- commandes et alertes avant analytics

## États

Chaque composant interactif doit prévoir:
default, pressed / active, disabled, loading, success, warning, error.

Les états utilisent les tokens sémantiques plutôt que des couleurs arbitraires.
