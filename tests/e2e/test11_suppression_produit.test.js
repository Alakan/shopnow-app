// Importe les outils Selenium utilisés pour piloter le navigateur et rechercher des éléments.
const { Builder, By, until } = require('selenium-webdriver');
// Importe les options spécifiques à Chrome ou Chromium.
const chrome = require('selenium-webdriver/chrome');
// Importe le module d'assertions fourni par Node.js.
const assert = require('assert');

// Utilise l'URL passée dans l'environnement ou l'URL locale par défaut.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';

// Regroupe les vérifications concernant la suppression d'un produit du panier.
describe("Test 10 - Suppression d'un produit", function () {
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

	// Vérifie qu'un produit peut être ajouté puis supprimé du panier.
	it('ajoute un produit puis le supprime du panier', async function () {
		// Ouvre la page d'accueil pour établir l'origine du site.
		await driver.get(SHOPNOW_URL);
		// Supprime un éventuel ancien panier pour commencer avec un état propre.
		await driver.executeScript('window.localStorage.removeItem("shopnow_cart");');
		// Ouvre la page Produits de ShopNow.
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
		// Ajoute le produit au panier.
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

		// Ouvre la page du panier pour vérifier la présence du produit.
		await driver.get(`${SHOPNOW_URL}/cart.html`);

		// Attend que le produit ajouté apparaisse dans le panier.
		const cartItem = await driver.wait(
			// Recherche le premier article présent dans le panier.
			until.elementLocated(By.css('.cart-item')),
			// Attend au maximum dix secondes l'affichage de l'article.
			10000,
			// Affiche ce message si le panier est vide.
			'Le produit ajouté n’est pas présent dans le panier'
		);

		// Vérifie que l'article du panier est visible.
		assert.strictEqual(await cartItem.isDisplayed(), true);
		// Recherche le bouton qui supprime l'article du panier.
		const removeButton = await cartItem.findElement(By.css('[data-action="remove"]'));
		// Supprime le produit sélectionné du panier.
		await removeButton.click();

		// Attend que l'état de panier vide soit affiché après la suppression.
		const emptyCart = await driver.wait(
			// Recherche l'élément qui indique que le panier est vide.
			until.elementLocated(By.css('[data-testid="empty-cart"]')),
			// Attend au maximum dix secondes la mise à jour du panier.
			10000,
			// Affiche ce message si le panier ne devient pas vide.
			'Le panier n’est pas vide après la suppression du produit'
		);

		// Vérifie que l'état de panier vide est visible.
		assert.strictEqual(await emptyCart.isDisplayed(), true);
		// Vérifie qu'aucun article ne reste affiché dans le panier.
		assert.strictEqual((await driver.findElements(By.css('.cart-item'))).length, 0);
	});
});
