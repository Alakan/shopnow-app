# Attributs `data-testid` — ShopNow

Ces identifiants stables servent de **contrat DOM** aux tests fonctionnels Selenium
(et au test de démonstration `ParcoursCommandeTest`). Une modification de l'un de
ces attributs **casse les tests** : c'est volontaire — c'est le mécanisme qui force
l'équipe à mettre à jour les tests quand l'interface change.

| `data-testid` | Élément | Page |
|---|---|---|
| `produit-{id}` | Carte / lien d'un produit (ex. `produit-382`) | Catalogue |
| `recherche` | Champ de recherche (texte) | Catalogue |
| `btn-rechercher` | Bouton de recherche | Catalogue |
| `ajouter-panier` | Bouton « Ajouter au panier » | Fiche produit |
| `lien-panier` | Lien vers le panier (header) | Toutes |
| `modifier-quantite` | Validation de la quantité | Panier |
| `supprimer-ligne` | Suppression d'une ligne | Panier |
| `commander` | Bouton « Commander » | Panier |
| `statut` | Statut courant de la commande | Confirmation |
| `numero-carte` | Champ numéro de carte | Confirmation |
| `payer` | Bouton « Payer » | Confirmation |
| `commande-{id}` | Lien vers une commande | Historique |
| `email` / `mot-de-passe` / `btn-connexion` | Formulaire de connexion | Connexion |
| `nom` / `email` / `mot-de-passe` / `btn-inscription` | Formulaire d'inscription | Inscription |

> Rappel : le produit **382** (Casque gaming Bluetooth) est seedé par `data.sql` —
> c'est la donnée de test stable utilisée par `ParcoursCommandeTest`.
