# ShopNow JS — Application sous test Selenium

Mini application e-commerce en **JavaScript / Node.js / Express**, destinée au TP INF243.

## Fonctionnalités
- Créer un compte
- Se connecter / se déconnecter
- Consulter le catalogue
- Consulter un produit
- Ajouter au panier
- Modifier la quantité
- Supprimer un produit
- Vider le panier
- Calculer le total
- API REST

## Lancer
```bash
npm install
npm start
```
Puis ouvrir `http://localhost:3000`.

## Compte de démonstration
Email : `alice@shopnow.test`
Mot de passe : `Password123!`

Les comptes sont conservés uniquement en mémoire et sont réinitialisés au redémarrage.

## Interface graphique des tests

Depuis la racine du workspace, lancez tous les tests avec le rapport HTML :

```bash
npm run test:ui
```

Le rapport est ensuite disponible dans `shopnow-app/reports/test-results.html`.
Ouvrez ce fichier dans VS Code avec **Open with Live Server**, ou dans le navigateur,
pour consulter une interface avec les tests réussis, les tests échoués et leur durée.

Dans le conteneur Linux, Chrome est exécuté sur un écran virtuel avec Xvfb. La fenêtre
Chrome elle-même n'est pas visible, mais le rapport HTML fournit l'interface graphique
des résultats et les tests qui enregistrent des captures les placent dans `screenshots/`.

Nom : BASTIDE
Anthony : Anthony

## Installation et exécution du TP

### Installer le projet

Depuis le dossier `shopnow-app`, installer les dépendances Node.js :

```bash
npm install
```

### Lancer ShopNow

Démarrer le serveur Express avec :

```bash
npm start
```

L'application est ensuite accessible à l'adresse suivante :

```text
http://localhost:3000
```

### Lancer les tests

Pour exécuter les 19 tests E2E :

```bash
npm test
```

Cette commande lance Mocha avec Chrome sur un écran virtuel Xvfb et génère le rapport
HTML Mochawesome dans `reports/test-results.html`.

Pour lancer uniquement la suite avec son rapport graphique :

```bash
npm run test:ui
```

Le rapport peut être servi avec un serveur HTTP :

```bash
npx http-server reports -p 4173
```

Puis ouvrir `http://localhost:4173` dans un navigateur.

### Navigateur utilisé

Les tests utilisent **Google Chrome** piloté par **Selenium WebDriver** et exécuté
avec Mocha. Dans le conteneur Linux, Chrome est lancé en mode headless avec Xvfb,
car aucune interface graphique native n'est disponible.

### Nombre de tests réalisés

La suite contient actuellement **19 tests E2E**, couvrant notamment :

- la navigation et l'accueil ;
- l'accès au catalogue et au détail produit ;
- la connexion réussie et refusée ;
- la création de compte et la déconnexion ;
- l'ajout de produits et la gestion du panier ;
- la modification des quantités et le calcul du total ;
- l'attente explicite Selenium ;
- le parcours utilisateur complet ;
- l'organisation en Page Objects ;
- l'ajout de plusieurs produits.

### Difficultés rencontrées et solutions apportées

- **Absence d'interface graphique dans le conteneur Linux** : utilisation de Chrome
	en mode headless avec `xvfb-run` et génération de captures PNG.
- **Erreur `SessionNotCreatedError` au démarrage de Chrome** : ajout des options
	`--headless=new`, `--no-sandbox`, `--disable-dev-shm-usage` et `--disable-gpu`.
- **Serveur parfois indisponible au démarrage d'un test** : ajout d'une attente
	explicite du serveur et démarrage automatique de `server.js` si nécessaire.
- **Tests dépendants de la vitesse de chargement** : utilisation de
	`driver.wait()` et de `until.elementLocated()` au lieu d'attentes fixes.
- **Rapport HTML Mocha vide ou blanc ouvert directement** : utilisation de
	Mochawesome et d'un serveur HTTP pour charger correctement ses fichiers JavaScript
	et CSS.
- **Organisation du code difficile à maintenir** : création des Page Objects
	`LoginPage`, `ProductsPage` et `CartPage` pour centraliser les sélecteurs et actions.

## API
`GET /api/products`
`GET /api/products/:id`
`POST /api/register`
`POST /api/login`

## Tests Selenium
Le TP Selenium doit être réalisé dans un projet de tests séparé. L'application constitue uniquement l'application sous test.

Les `data-testid` disponibles sont listés dans `data-testids.md`.
