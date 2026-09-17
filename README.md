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

## API
`GET /api/products`
`GET /api/products/:id`
`POST /api/register`
`POST /api/login`

## Tests Selenium
Le TP Selenium doit être réalisé dans un projet de tests séparé. L'application constitue uniquement l'application sous test.

Les `data-testid` disponibles sont listés dans `data-testids.md`.
