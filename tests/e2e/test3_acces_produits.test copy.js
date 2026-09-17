// Importe les outils Selenium utilisés pour piloter le navigateur et rechercher des éléments.
const { Builder, By, until } = require('selenium-webdriver');
// Importe les options spécifiques à Chrome ou Chromium.
const chrome = require('selenium-webdriver/chrome');
// Importe le module d'assertions fourni par Node.js.
const assert = require('assert');

// Utilise l'URL passée dans l'environnement ou l'URL locale par défaut.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';

// Regroupe les vérifications concernant l'accès au catalogue de produits.
describe('Test 2 - Accès aux produits', function () {
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

	// Vérifie que l'utilisateur peut accéder à la page Produits et voir des produits.
	it('accède à la page Produits et affiche le catalogue', async function () {
		// Ouvre la page d'accueil de ShopNow.
		await driver.get(SHOPNOW_URL);

		// Attend que le lien permettant d'accéder aux produits soit présent.
		const productsLink = await driver.wait(
			// Recherche le lien Produits grâce à son identifiant de test.
			until.elementLocated(By.css('[data-testid="products-link"]')),
			// Attend au maximum dix secondes l'apparition du lien.
			10000,
			// Affiche ce message si le lien n'est pas trouvé.
			"Le lien vers la page Produits est introuvable"
		);

		// Clique sur le lien pour reproduire l'accès d'un utilisateur au catalogue.
		await productsLink.click();

		// Attend que l'élément identifiant la page Produits soit présent.
		const productsPage = await driver.wait(
			// Recherche l'élément portant l'identifiant de test de la page Produits.
			until.elementLocated(By.css('[data-testid="products-page"]')),
			// Attend au maximum dix secondes l'affichage de la page.
			10000,
			// Affiche ce message si la page Produits n'est pas trouvée.
			'La page Produits est introuvable'
		);

		// Vérifie que la page Produits est visible.
		assert.strictEqual(await productsPage.isDisplayed(), true);
		// Vérifie que l'URL courante indique la page des produits.
		assert.match(await driver.getCurrentUrl(), /products\.html/i);

		// Attend qu'au moins une carte produit soit créée par le script du catalogue.
		await driver.wait(
			// Vérifie que le nombre de cartes produits est supérieur à zéro.
			async function () {
				// Récupère toutes les cartes produits actuellement présentes dans la page.
				const productCards = await driver.findElements(By.css('.product-card'));
				// Retourne vrai lorsque le catalogue contient au moins un produit.
				return productCards.length > 0;
			},
			// Attend au maximum dix secondes le chargement du catalogue.
			10000,
			// Affiche ce message si aucun produit n'est chargé.
			'Aucun produit n’est présent dans le catalogue'
		);

		// Récupère les cartes produits après leur chargement.
		const productCards = await driver.findElements(By.css('.product-card'));
		// Vérifie explicitement que le catalogue contient au moins un produit.
		assert.ok(productCards.length > 0, 'Aucun produit n’est présent dans le catalogue');
	});
});
