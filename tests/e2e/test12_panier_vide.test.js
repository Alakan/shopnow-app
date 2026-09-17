// Importe les outils Selenium utilisés pour piloter le navigateur et rechercher des éléments.
const { Builder, By, until } = require('selenium-webdriver');
// Importe les options spécifiques à Chrome ou Chromium.
const chrome = require('selenium-webdriver/chrome');
// Importe le module d'assertions fourni par Node.js.
const assert = require('assert');

// Utilise l'URL passée dans l'environnement ou l'URL locale par défaut.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';

// Regroupe les vérifications concernant le vidage complet du panier.
describe('Test 11 - Panier vide', function () {
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

	// Vérifie que le panier peut être vidé et que son état vide est affiché.
	it('vide le panier et affiche correctement son état vide', async function () {
		// Ouvre la page d'accueil pour établir l'origine du site.
		await driver.get(SHOPNOW_URL);
		// Supprime un éventuel ancien panier pour commencer avec un état contrôlé.
		await driver.executeScript('window.localStorage.removeItem("shopnow_cart");');
		// Ouvre la page Produits afin d'ajouter un produit au panier.
		await driver.get(`${SHOPNOW_URL}/products.html`);

		// Attend que le premier produit soit affiché dans le catalogue.
		const productCard = await driver.wait(
			// Recherche la première carte produit disponible.
			until.elementLocated(By.css('.product-card')),
			// Attend au maximum dix secondes le chargement du catalogue.
			10000,
			// Affiche ce message si aucun produit n'est trouvé.
			'Aucun produit n’est affiché dans le catalogue'
		);

		// Recherche le bouton d'ajout du premier produit.
		const addButton = await productCard.findElement(By.css('[data-testid^="add-to-cart-"]'));
		// Ajoute le produit pour rendre le panier non vide avant de le vider.
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

		// Ouvre la page du panier pour vérifier qu'il contient bien le produit.
		await driver.get(`${SHOPNOW_URL}/cart.html`);

		// Attend qu'un article soit présent dans le panier avant de le vider.
		const cartItem = await driver.wait(
			// Recherche le premier article affiché dans le panier.
			until.elementLocated(By.css('.cart-item')),
			// Attend au maximum dix secondes l'affichage de l'article.
			10000,
			// Affiche ce message si le panier est vide trop tôt.
			'Le produit ajouté n’est pas présent dans le panier'
		);

		// Vérifie que le produit est visible avant l'action de vidage.
		assert.strictEqual(await cartItem.isDisplayed(), true);
		// Recherche le bouton qui vide entièrement le panier.
		const clearCartButton = await driver.findElement(By.css('[data-testid="clear-cart"]'));
		// Clique sur le bouton de vidage du panier.
		await clearCartButton.click();

		// Attend que l'état visuel de panier vide soit affiché.
		const emptyCart = await driver.wait(
			// Recherche l'élément indiquant que le panier est vide.
			until.elementLocated(By.css('[data-testid="empty-cart"]')),
			// Attend au maximum dix secondes le rendu du panier vide.
			10000,
			// Affiche ce message si l'état vide n'est pas affiché.
			"L'état panier vide n'est pas affiché"
		);

		// Vérifie que l'état panier vide est visible.
		assert.strictEqual(await emptyCart.isDisplayed(), true);
		// Vérifie qu'aucun produit ne reste dans le panier.
		assert.strictEqual((await driver.findElements(By.css('.cart-item'))).length, 0);
		// Vérifie que le compteur du panier indique zéro produit.
		assert.strictEqual(await driver.findElement(By.css('#cart-count')).getText(), '0');
	});
});
