// Importe les outils Selenium utilisés pour piloter le navigateur et rechercher des éléments.
const { Builder, By, until } = require('selenium-webdriver');
// Importe les options spécifiques à Chrome ou Chromium.
const chrome = require('selenium-webdriver/chrome');
// Importe le module d'assertions fourni par Node.js.
const assert = require('assert');

// Utilise l'URL passée dans l'environnement ou l'URL locale par défaut.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';

// Regroupe les vérifications concernant le détail d'un produit.
describe("Test 3 - Détail d'un produit", function () {
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

	// Vérifie que l'utilisateur peut sélectionner un produit et consulter ses informations.
	it("affiche le détail d'un produit sélectionné", async function () {
		// Ouvre la page d'accueil de ShopNow.
		await driver.get(SHOPNOW_URL);

		// Attend que le lien vers la page Produits soit disponible.
		const productsLink = await driver.wait(
			// Recherche le lien Produits grâce à son identifiant de test.
			until.elementLocated(By.css('[data-testid="products-link"]')),
			// Attend au maximum dix secondes l'apparition du lien.
			10000,
			// Affiche ce message si le lien n'est pas trouvé.
			"Le lien vers la page Produits est introuvable"
		);

		// Ouvre le catalogue en cliquant sur le lien Produits.
		await productsLink.click();

		// Attend qu'un bouton Voir soit généré pour un produit du catalogue.
		const viewProductLink = await driver.wait(
			// Recherche le premier lien permettant d'ouvrir un détail produit.
			until.elementLocated(By.css('[data-testid^="view-product-"]')),
			// Attend au maximum dix secondes le chargement du catalogue.
			10000,
			// Affiche ce message si aucun produit sélectionnable n'est trouvé.
			'Aucun produit sélectionnable n’est présent dans le catalogue'
		);

		// Sélectionne le premier produit en ouvrant sa page de détail.
		await viewProductLink.click();

		// Attend que l'élément identifiant la page de détail soit présent.
		const productPage = await driver.wait(
			// Recherche l'élément portant l'identifiant de test de la page produit.
			until.elementLocated(By.css('[data-testid="product-page"]')),
			// Attend au maximum dix secondes l'affichage de la page de détail.
			10000,
			// Affiche ce message si la page de détail n'est pas trouvée.
			'La page de détail du produit est introuvable'
		);

		// Vérifie que la page de détail est visible.
		assert.strictEqual(await productPage.isDisplayed(), true);
		// Vérifie que l'URL contient bien le chemin de détail produit.
		assert.match(await driver.getCurrentUrl(), /product\.html\?id=\d+/i);

		// Attend que le nom du produit soit présent dans la page.
		const productName = await driver.wait(
			// Recherche l'élément contenant le nom du produit.
			until.elementLocated(By.css('[data-testid="product-name"]')),
			// Attend au maximum dix secondes l'apparition du nom.
			10000,
			// Affiche ce message si le nom n'est pas trouvé.
			'Le nom du produit est introuvable'
		);

		// Vérifie que le nom du produit est visible.
		assert.strictEqual(await productName.isDisplayed(), true);
		// Vérifie que le nom du produit contient du texte.
		assert.ok((await productName.getText()).trim().length > 0, 'Le nom du produit est vide');

		// Attend que le prix du produit soit présent dans la page.
		const productPrice = await driver.wait(
			// Recherche l'élément contenant le prix du produit.
			until.elementLocated(By.css('[data-testid="product-price"]')),
			// Attend au maximum dix secondes l'apparition du prix.
			10000,
			// Affiche ce message si le prix n'est pas trouvé.
			'Le prix du produit est introuvable'
		);

		// Vérifie que le prix du produit est visible.
		assert.strictEqual(await productPrice.isDisplayed(), true);
		// Vérifie que le prix du produit contient une valeur affichée.
		assert.ok((await productPrice.getText()).trim().length > 0, 'Le prix du produit est vide');
	});
});
