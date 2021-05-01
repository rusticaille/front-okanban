# front-okanban

(avril 2021)
Création de la partie front du projet Okanban: appli de gestion de projet à la manière simplifiée d'un tableau kanban.
Manipulation du DOM, à la dure...sans framework front.
Utilisation du drag n drop avec Sortable js.
Utilisation de bulma pour le CSS.
Utilisation de templates html.
l'API est ici : https://github.com/rusticaille/API-okanban

  ## Fonctionnalités
  
  - Cette appli dispose de trois types d'éléments : des listes, des cartes et des catégories (labels).
  - Pour chacun de ces éléments il est possible d'en créer, supprimer et d'en modifier les propriétés à sa guise (nom, couleur, contenu).
  - Il est aussi possible de déplacer les listes mais aussi les cartes, à l'intérieur d'une même liste ou dans une autre liste.

    ### Les listes
    
    - Ajouter une liste grâce au bouton "ajouter une liste" tout à droite de la scrollbar.
    - Supprimer des listes grâce à l'icône "poubelle" en haut à droite de chaque liste
    - Changer son titre en double cliquant sur son nom
    - Déplacer chaque liste avec le drag n drop
    
    ### Les cartes
    
    - Ajouter des cartes grâce à l'icône "+" en haut à droite de chaque liste.
    - Supprimer, modifier ou ajouter un label grâce aux icônes en haut à droit de chaque carte
    - les déplacer dans la liste ou d'une liste à l'autre
    
    ### Les labels
    
    - Ajouter un label existant ou créer un tout nouveau label (nom, couleur du fond et couleur du texte) grâce à l'icône "tag" en haut à droite de chaque carte.
    - Supprimer un label grâce au bouton "Supprimer une catégorie" tout à droite de la scrollbar.
 
