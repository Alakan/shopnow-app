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

## API
`GET /api/products`
`GET /api/products/:id`
`POST /api/register`
`POST /api/login`

## Tests Selenium
Le TP Selenium doit être réalisé dans un projet de tests séparé. L'application constitue uniquement l'application sous test.

Les `data-testid` disponibles sont listés dans `data-testids.md`.
