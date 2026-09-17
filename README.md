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
Une version PDF prête à remettre est disponible dans
[reports/rapport-tests-shopnow.pdf](reports/rapport-tests-shopnow.pdf).

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

## Questions de synthèse

### 1. Quel est le rôle de Selenium WebDriver ?

Selenium WebDriver permet de piloter automatiquement un navigateur réel avec du
code. Dans ce projet, il ouvre les pages ShopNow, clique sur les éléments, saisit
des informations, attend les changements d'interface et vérifie les résultats
comme le ferait un utilisateur.

### 2. Qu'est-ce qu'un sélecteur ?

Un sélecteur est une expression utilisée par Selenium pour identifier un élément
HTML dans la page. Les tests utilisent par exemple des sélecteurs CSS comme
`[data-testid="login-form"]`, `.product-card` ou `[data-action="increase"]`.

### 3. Pourquoi utiliser `data-testid` ?

`data-testid` fournit un identifiant stable et dédié aux tests. Il évite de
dépendre de la structure visuelle, des classes CSS ou du texte affiché, qui peuvent
changer pour des raisons de design sans modifier le comportement de l'application.

### 4. Pourquoi utiliser des assertions ?

Les assertions comparent le résultat observé avec le résultat attendu. Elles
transforment une action automatisée en vérification : par exemple, elles confirment
qu'une page est visible, qu'un utilisateur est connecté ou que le total du panier
est correct.

### 5. Pourquoi utiliser des attentes explicites ?

Les attentes explicites permettent d'attendre une condition réelle, comme la
présence d'un élément ou la mise à jour d'une quantité, avant de poursuivre. Elles
rendent les tests plus fiables lorsque le chargement dépend du réseau, de l'API ou
de la vitesse de la machine, contrairement à une pause fixe.

### 6. Quelle différence entre un test fonctionnel et un test End-to-End ?

Un test fonctionnel vérifie généralement une fonctionnalité précise, comme la
connexion ou l'ajout d'un produit. Un test End-to-End vérifie un parcours complet
à travers plusieurs pages et fonctionnalités, de la connexion jusqu'à la
modification et la suppression d'un article dans le panier.

### 7. Pourquoi réaliser des tests négatifs ?

Les tests négatifs vérifient que l'application réagit correctement aux situations
invalides ou interdites. Le test de connexion refusée confirme par exemple qu'un
mot de passe incorrect n'ouvre pas de session et qu'un message d'erreur est affiché.
Ils permettent de détecter les erreurs de validation et les comportements
inattendus.

### 8. Quel est l'intérêt du Page Object Model ?

Le Page Object Model sépare le scénario de test des sélecteurs et des actions
propres à chaque page. Les classes `LoginPage`, `ProductsPage` et `CartPage`
centralisent ces éléments. Le code est ainsi plus lisible, réutilisable et plus
facile à modifier si l'interface change.

### 9. Quels problèmes avez-vous rencontrés pendant l'automatisation ?

Les principales difficultés ont été l'absence d'interface graphique dans le
conteneur Linux, le démarrage de Chrome sans affichage, la disponibilité variable
du serveur et le chargement asynchrone des produits et du panier. Le rapport HTML
ouvert directement affichait également une page blanche.

### 10. Quels sont les avantages et les limites de Selenium ?

Selenium permet de tester un navigateur réel, plusieurs navigateurs et des parcours
utilisateur complets. Il s'appuie sur des sélecteurs et des assertions proches des
actions réelles, ce qui est utile pour valider l'interface.

Ses limites sont une exécution plus lente et plus fragile que des tests unitaires,
la nécessité de gérer le navigateur et son environnement, ainsi que les problèmes
liés aux délais de chargement. Dans un conteneur sans bureau, il faut aussi utiliser
le mode headless, Xvfb ou un bureau distant, et les tests restent dépendants de la
structure HTML de l'application.

## Scénario End-to-End principal

Le test [test14_parcours_complet.test.js](tests/e2e/test14_parcours_complet.test.js)
simule le parcours complet d'un client :

```text
Connexion
	↓
Produits
	↓
Choix d'un produit
	↓
Détail
	↓
Ajout au panier
	↓
Quantité = 2
	↓
Vérification du total
	↓
Suppression
	↓
Panier vide
```

Ce test est automatisé avec Selenium WebDriver, utilise des sélecteurs CSS et des
attentes explicites, et contient plus de cinq assertions. Il est reproductible car
le panier est réinitialisé au début du scénario et le serveur est démarré
automatiquement s'il n'est pas déjà disponible. Les actions sont organisées dans
les Page Objects `LoginPage`, `ProductsPage` et `CartPage`.

## Workflow du TP

```text
FORK
 ↓
CLONE
 ↓
npm install
 ↓
npm start
 ↓
Explorer ShopNow
 ↓
Inspecter les éléments
 ↓
Identifier les sélecteurs
 ↓
Installer Selenium
 ↓
Premier test
 ↓
Écrire les tests
 ↓
Tests négatifs
 ↓
Test E2E
 ↓
Page Object Model
 ↓
npm test
 ↓
COMMIT
 ↓
PUSH
```

## API
`GET /api/products`
`GET /api/products/:id`
`POST /api/register`
`POST /api/login`

## Tests Selenium
Le TP Selenium doit être réalisé dans un projet de tests séparé. L'application constitue uniquement l'application sous test.

Les `data-testid` disponibles sont listés dans `data-testids.md`.
