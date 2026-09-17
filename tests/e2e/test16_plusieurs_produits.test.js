// Importe les sélecteurs Selenium et l'attente explicite until.
const { By, until } = require('selenium-webdriver');
// Importe les assertions intégrées à Node.js.
const assert = require('assert');
// Importe les fonctions communes de démarrage du serveur et du navigateur.
const { SHOPNOW_URL, createDriver, startServerIfNeeded } = require('../support/test_setup');

// Regroupe les vérifications concernant l'ajout de plusieurs produits.
describe('Test supplémentaire - Ajout de plusieurs produits', function () {
	// Autorise trente secondes pour exécuter le scénario complet.
	this.timeout(30000);
	// Déclare la session Selenium utilisée par le scénario.
	let driver;
	// Déclare le serveur éventuellement démarré par ce test.
	let serverProcess;

	// Prépare l'application et le navigateur avant l'exécution du test.
	before(async function () {
		// Démarre le serveur uniquement si aucune instance ne répond déjà.
		serverProcess = await startServerIfNeeded();
		// Crée le navigateur Chrome configuré pour le conteneur Linux.
		driver = await createDriver();
	});

	// Libère les ressources utilisées par le test.
	after(async function () {
		// Ferme le navigateur lorsqu'il a bien été créé.
		if (driver) await driver.quit();
		// Arrête seulement le serveur lancé par ce fichier.
		if (serverProcess) serverProcess.kill('SIGTERM');
	});

	// Vérifie qu'un utilisateur peut ajouter deux produits différents dans son panier.
	it('ajoute deux produits et vérifie leur présence dans le panier', async function () {
		// Ouvre l'accueil pour établir l'origine du stockage local.
		await driver.get(SHOPNOW_URL);
		// Supprime le panier précédent afin de commencer avec un état propre.
		await driver.executeScript('window.localStorage.removeItem("shopnow_cart");');
		// Ouvre la page du catalogue des produits.
		await driver.get(`${SHOPNOW_URL}/products.html`);

		// Attend que les cartes produits soient chargées depuis l'API.
		const productCards = await driver.wait(
			// Recherche toutes les cartes produits présentes dans le catalogue.
			async function () {
				// Récupère les éléments correspondant au sélecteur des cartes.
				const cards = await driver.findElements(By.css('.product-card'));
				// Retourne les cartes seulement lorsqu'au moins deux produits sont disponibles.
				return cards.length >= 2 ? cards : false;
			},
			// Attend au maximum dix secondes le chargement de deux produits.
			10000,
			// Affiche un message utile si le catalogue contient moins de deux produits.
			'Le catalogue ne contient pas au moins deux produits'
		);

		// Vérifie qu'au moins deux produits sont effectivement disponibles.
		assert.ok(productCards.length >= 2, 'Deux produits sont nécessaires pour ce scénario');
		// Récupère le nom du premier produit pour le comparer avec le panier.
		const firstProductName = await productCards[0].findElement(By.css('[data-testid^="product-"]')).getText();
		// Récupère le nom du deuxième produit pour vérifier qu'il est différent.
		const secondProductName = await productCards[1].findElement(By.css('[data-testid^="product-"]')).getText();
		// Vérifie que les deux cartes correspondent à deux produits différents.
		assert.notStrictEqual(firstProductName, secondProductName);

		// Ajoute le premier produit en cliquant sur son bouton dédié.
		await productCards[0].findElement(By.css('[data-testid^="add-to-cart-"]')).click();
		// Attend l'alerte de confirmation du premier ajout.
		const firstAlert = await driver.wait(async function () {
			// Essaie de récupérer l'alerte ouverte par l'application.
			try {
				// Retourne l'alerte lorsqu'elle est disponible.
				return await driver.switchTo().alert();
			} catch {
				// Indique à Selenium de continuer à attendre.
				return false;
			}
		}, 10000, "L'alerte du premier ajout est introuvable");
		// Ferme l'alerte avant de continuer le scénario.
		await firstAlert.accept();

		// Ajoute le deuxième produit avec son propre bouton.
		await productCards[1].findElement(By.css('[data-testid^="add-to-cart-"]')).click();
		// Attend l'alerte de confirmation du deuxième ajout.
		const secondAlert = await driver.wait(async function () {
			// Essaie de récupérer l'alerte actuellement affichée.
			try {
				// Retourne l'alerte si elle est disponible.
				return await driver.switchTo().alert();
			} catch {
				// Continue l'attente tant que l'alerte n'est pas disponible.
				return false;
			}
		}, 10000, "L'alerte du deuxième ajout est introuvable");
		// Ferme l'alerte du deuxième ajout.
		await secondAlert.accept();

		// Attend que le compteur du panier affiche les deux produits ajoutés.
		await driver.wait(
			// Vérifie le texte actuellement affiché dans le compteur.
			async function () {
				// Récupère le compteur du panier.
				const cartCount = await driver.findElement(By.css('#cart-count')).getText();
				// Retourne vrai lorsque le compteur vaut deux.
				return cartCount === '2';
			},
			// Attend au maximum dix secondes la mise à jour du compteur.
			10000,
			// Explique l'échec si le compteur ne se met pas à jour.
			'Le compteur du panier ne vaut pas deux'
		);
		// Vérifie que le compteur confirme la présence de deux produits.
		assert.strictEqual(await driver.findElement(By.css('#cart-count')).getText(), '2');

		// Ouvre la page du panier grâce à son lien de navigation.
		await driver.findElement(By.css('[data-testid="cart-link"]')).click();
		// Attend que la page du panier soit chargée.
		await driver.wait(
			// Recherche le conteneur principal du panier.
			until.elementLocated(By.css('[data-testid="cart-page"]')),
			// Attend au maximum dix secondes l'affichage de la page.
			10000,
			// Signale si la page du panier n'est pas trouvée.
			'La page du panier est introuvable'
		);

		// Attend que deux articles soient présents dans le panier.
		const cartItems = await driver.wait(
			// Recherche les articles rendus dans le panier.
			async function () {
				// Récupère tous les articles visibles.
				const items = await driver.findElements(By.css('.cart-item'));
				// Retourne les articles seulement lorsque les deux sont présents.
				return items.length === 2 ? items : false;
			},
			// Attend au maximum dix secondes le rendu des articles.
			10000,
			// Affiche un message si les deux produits ne sont pas affichés.
			'Les deux produits ne sont pas présents dans le panier'
		);

		// Vérifie que le panier affiche bien deux lignes d'articles.
		assert.strictEqual(cartItems.length, 2);
		// Récupère les noms affichés dans les deux lignes du panier.
		const cartProductNames = await Promise.all(cartItems.map(async function (item) {
			// Retourne le nom de l'article courant.
			return item.findElement(By.css('[data-testid^="cart-product-"]')).getText();
		}));
		// Vérifie que le premier produit ajouté est retrouvé dans le panier.
		assert.ok(cartProductNames.includes(firstProductName));
		// Vérifie que le deuxième produit ajouté est retrouvé dans le panier.
		assert.ok(cartProductNames.includes(secondProductName));

		// Vide le panier pour laisser l'application dans un état propre.
		await driver.findElement(By.css('[data-testid="clear-cart"]')).click();
		// Attend que l'état visuel de panier vide soit affiché.
		const emptyCart = await driver.wait(
			// Recherche l'élément qui indique que le panier est vide.
			until.elementLocated(By.css('[data-testid="empty-cart"]')),
			// Attend au maximum dix secondes la mise à jour du panier.
			10000,
			// Signale si l'état vide n'est pas affiché.
			"L'état panier vide n'est pas affiché"
		);
		// Vérifie que le panier est effectivement vide à la fin du scénario.
		assert.strictEqual(await emptyCart.isDisplayed(), true);
	});
});
