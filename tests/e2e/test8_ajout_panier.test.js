// Importe les outils Selenium utilisés pour piloter le navigateur et rechercher des éléments.
const { Builder, By, until } = require('selenium-webdriver');
// Importe les options spécifiques à Chrome ou Chromium.
const chrome = require('selenium-webdriver/chrome');
// Importe le module d'assertions fourni par Node.js.
const assert = require('assert');

// Utilise l'URL passée dans l'environnement ou l'URL locale par défaut.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';

// Regroupe les vérifications concernant l'ajout d'un produit au panier.
describe('Test 7 - Ajout au panier', function () {
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

	// Vérifie qu'un produit peut être ajouté et retrouvé dans le panier.
	it('ajoute un produit au panier et le retrouve dans le panier', async function () {
		// Ouvre la page d'accueil pour établir l'origine du site.
		await driver.get(SHOPNOW_URL);
		// Supprime un éventuel ancien panier afin que le test parte d'un état propre.
		await driver.executeScript('window.localStorage.removeItem("shopnow_cart");');
		// Ouvre la page Produits de ShopNow.
		await driver.get(`${SHOPNOW_URL}/products.html`);

		// Attend que le premier produit soit affiché dans le catalogue.
		const productCard = await driver.wait(
			// Recherche la première carte générée par le catalogue.
			until.elementLocated(By.css('.product-card')),
			// Attend au maximum dix secondes le chargement d'un produit.
			10000,
			// Affiche ce message si aucun produit n'est chargé.
			'Aucun produit n’est affiché dans le catalogue'
		);

		// Vérifie que la page Produits est visible.
		assert.strictEqual(await driver.findElement(By.css('[data-testid="products-page"]')).isDisplayed(), true);
		// Récupère le nom du produit sélectionné pour le vérifier plus tard dans le panier.
		const productName = await productCard.findElement(By.css('[data-testid^="product-"]')).getText();
		// Recherche le bouton d'ajout situé dans la première carte produit.
		const addButton = await productCard.findElement(By.css('[data-testid^="add-to-cart-"]'));
		// Ajoute le produit sélectionné au panier.
		await addButton.click();

		// Attend l'alerte qui confirme l'ajout du produit.
		const addAlert = await driver.wait(
			// Vérifie qu'une alerte navigateur est disponible.
			async function () {
				// Essaie de récupérer l'alerte actuellement affichée.
				try {
					// Retourne l'alerte si elle existe.
					return await driver.switchTo().alert();
				} catch (error) {
					// Retourne une valeur fausse tant que l'alerte n'est pas apparue.
					return false;
				}
			},
			// Attend au maximum dix secondes l'apparition de l'alerte.
			10000,
			// Affiche ce message si l'ajout ne déclenche aucune alerte.
			"L'alerte de confirmation d'ajout est introuvable"
		);
		// Ferme l'alerte pour permettre au navigateur de continuer les actions.
		await addAlert.accept();

		// Vérifie que le compteur du panier indique une unité.
		assert.strictEqual(await driver.findElement(By.css('#cart-count')).getText(), '1');
		// Ouvre le panier depuis le lien de navigation.
		await driver.findElement(By.css('[data-testid="cart-link"]')).click();

		// Attend que la page du panier soit affichée.
		const cartPage = await driver.wait(
			// Recherche l'élément identifiant la page du panier.
			until.elementLocated(By.css('[data-testid="cart-page"]')),
			// Attend au maximum dix secondes l'affichage du panier.
			10000,
			// Affiche ce message si la page du panier n'est pas trouvée.
			'La page du panier est introuvable'
		);

		// Vérifie que la page du panier est visible.
		assert.strictEqual(await cartPage.isDisplayed(), true);
		// Attend que l'article ajouté soit présent dans le panier.
		const cartItem = await driver.wait(
			// Recherche le premier article affiché dans le panier.
			until.elementLocated(By.css('.cart-item')),
			// Attend au maximum dix secondes l'affichage de l'article.
			10000,
			// Affiche ce message si le produit n'est pas retrouvé.
			'Le produit ajouté n’est pas présent dans le panier'
		);

		// Vérifie que le produit sélectionné est bien présent dans le panier.
		assert.strictEqual(await cartItem.findElement(By.css('[data-testid^="cart-product-"]')).getText(), productName);
		// Vérifie que la quantité du produit ajouté est égale à un.
		assert.strictEqual(await cartItem.findElement(By.css('[data-testid^="quantity-"]')).getText(), '1');
	});
});
