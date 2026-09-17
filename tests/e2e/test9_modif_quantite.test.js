// Importe les outils Selenium utilisés pour piloter le navigateur et rechercher des éléments.
const { Builder, By, until } = require('selenium-webdriver');
// Importe les options spécifiques à Chrome ou Chromium.
const chrome = require('selenium-webdriver/chrome');
// Importe le module d'assertions fourni par Node.js.
const assert = require('assert');

// Utilise l'URL passée dans l'environnement ou l'URL locale par défaut.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';

// Regroupe les vérifications concernant la modification de la quantité dans le panier.
describe('Test 8 - Modification de la quantité', function () {
	// Définit une durée maximale de trente secondes pour le test.
	this.timeout(30000);

	// Déclare la variable qui contiendra le navigateur Selenium.
	let driver;

	// Prépare le navigateur avant l'exécution du test.
	before(async function () {
		// Configure Chromium pour fonctionner sans interface graphique dans le conteneur.
		const chromeOptions = new chrome.Options().addArguments(
			// Lance le navigateur en mode headless, sans fenêtre visible.
			'--headless=new',
			// Autorise Chromium à fonctionner avec l'utilisateur du conteneur.
			'--no-sandbox',
			// Évite les problèmes liés à la mémoire partagée limitée du conteneur.
			'--disable-dev-shm-usage',
			// Désactive l'accélération graphique, inutile pour ce test.
			'--disable-gpu'
		);
		// Utilise le binaire indiqué par l'environnement lorsqu'il est fourni.
		if (process.env.CHROME_BIN) {
			// Définit le chemin du navigateur Chrome ou Chromium à utiliser.
			chromeOptions.setChromeBinaryPath(process.env.CHROME_BIN);
		}
		// Construit une instance de navigateur Chrome contrôlée par Selenium.
		driver = await new Builder()
			// Indique que le navigateur à piloter est Chrome.
			.forBrowser('chrome')
			// Applique les options de démarrage définies précédemment.
			.setChromeOptions(chromeOptions)
			// Démarre effectivement le navigateur.
			.build();
	});

	// Ferme le navigateur après l'exécution du test.
	after(async function () {
		// Ferme la session Selenium si elle a bien été créée.
		if (driver) {
			// Libère les ressources utilisées par le navigateur.
			await driver.quit();
		}
	});

	// Vérifie qu'une quantité peut être augmentée puis diminuée.
	it('augmente puis diminue la quantité d’un produit', async function () {
		// Ouvre la page d'accueil pour établir l'origine du site.
		await driver.get(SHOPNOW_URL);
		// Supprime un éventuel ancien panier pour commencer avec un seul produit.
		await driver.executeScript('window.localStorage.removeItem("shopnow_cart");');
		// Ouvre le catalogue des produits.
		await driver.get(`${SHOPNOW_URL}/products.html`);

		// Attend que le premier produit soit chargé dans le catalogue.
		const productCard = await driver.wait(
			// Recherche la première carte produit affichée.
			until.elementLocated(By.css('.product-card')),
			// Attend au maximum dix secondes le chargement du produit.
			10000,
			// Affiche ce message si aucun produit n'est chargé.
			'Aucun produit n’est affiché dans le catalogue'
		);

		// Recherche le bouton d'ajout du premier produit.
		const addButton = await productCard.findElement(By.css('[data-testid^="add-to-cart-"]'));
		// Ajoute le produit au panier avec une quantité initiale de un.
		await addButton.click();

		// Attend l'alerte qui confirme l'ajout du produit.
		const addAlert = await driver.wait(
			// Essaie de récupérer l'alerte actuellement affichée.
			async function () {
				// Retourne l'alerte si elle existe.
				try {
					// Récupère l'alerte ouverte par l'application.
					return await driver.switchTo().alert();
				} catch (error) {
					// Retourne une valeur fausse tant que l'alerte n'est pas disponible.
					return false;
				}
			},
			// Attend au maximum dix secondes l'apparition de l'alerte.
			10000,
			// Affiche ce message si l'alerte n'est pas apparue.
			"L'alerte de confirmation d'ajout est introuvable"
		);
		// Ferme l'alerte pour poursuivre le scénario.
		await addAlert.accept();

		// Ouvre directement la page du panier.
		await driver.get(`${SHOPNOW_URL}/cart.html`);

		// Attend qu'un article soit présent dans le panier.
		let cartItem = await driver.wait(
			// Recherche le premier article du panier.
			until.elementLocated(By.css('.cart-item')),
			// Attend au maximum dix secondes l'affichage de l'article.
			10000,
			// Affiche ce message si le panier est vide.
			'Le panier ne contient aucun produit'
		);

		// Vérifie que le produit est initialement présent avec une quantité de un.
		assert.strictEqual(await cartItem.findElement(By.css('[data-testid^="quantity-"]')).getText(), '1');
		// Recherche le bouton qui augmente la quantité.
		const increaseButton = await cartItem.findElement(By.css('[data-action="increase"]'));
		// Augmente la quantité du produit.
		await increaseButton.click();

		// Attend que la quantité affichée devienne deux après le rafraîchissement du panier.
		await driver.wait(
			// Recherche la quantité actuelle dans le panier.
			async function () {
				// Récupère l'article après le nouveau rendu HTML.
				cartItem = await driver.findElement(By.css('.cart-item'));
				// Retourne vrai lorsque la quantité affichée vaut deux.
				return (await cartItem.findElement(By.css('[data-testid^="quantity-"]')).getText()) === '2';
			},
			// Attend au maximum dix secondes la mise à jour de la quantité.
			10000,
			// Affiche ce message si la quantité n'augmente pas.
			'La quantité du produit n’a pas été augmentée'
		);

		// Vérifie que la nouvelle quantité est bien égale à deux.
		assert.strictEqual(await cartItem.findElement(By.css('[data-testid^="quantity-"]')).getText(), '2');
		// Recherche le bouton qui diminue la quantité.
		const decreaseButton = await cartItem.findElement(By.css('[data-action="decrease"]'));
		// Diminue la quantité du produit.
		await decreaseButton.click();

		// Attend que la quantité affichée redevienne une après le rafraîchissement du panier.
		await driver.wait(
			// Recherche la quantité actuelle dans le panier.
			async function () {
				// Récupère l'article après le nouveau rendu HTML.
				cartItem = await driver.findElement(By.css('.cart-item'));
				// Retourne vrai lorsque la quantité affichée vaut une.
				return (await cartItem.findElement(By.css('[data-testid^="quantity-"]')).getText()) === '1';
			},
			// Attend au maximum dix secondes la mise à jour de la quantité.
			10000,
			// Affiche ce message si la quantité ne diminue pas.
			'La quantité du produit n’a pas été diminuée'
		);

		// Vérifie que la quantité finale est bien égale à une.
		assert.strictEqual(await cartItem.findElement(By.css('[data-testid^="quantity-"]')).getText(), '1');
	});
});
