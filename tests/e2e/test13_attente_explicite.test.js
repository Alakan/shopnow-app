// Importe les outils Selenium nécessaires au scénario et aux attentes explicites.
const { By, until } = require('selenium-webdriver');
// Importe les assertions Node.js.
const assert = require('assert');
// Importe les outils communs de démarrage et de création du navigateur.
const { SHOPNOW_URL, createDriver, startServerIfNeeded } = require('../support/test_setup');

// Regroupe le test consacré à l'attente explicite Selenium.
describe('Test 13 - Attente explicite Selenium', function () {
	// Autorise trente secondes pour le scénario complet.
	this.timeout(30000);
	// Déclare la session Selenium.
	let driver;
	// Déclare le processus du serveur éventuellement démarré.
	let serverProcess;

	// Prépare le serveur et le navigateur avant le test.
	before(async function () {
		// Démarre le serveur uniquement s'il n'est pas déjà disponible.
		serverProcess = await startServerIfNeeded();
		// Crée une session Chrome configurée pour le conteneur.
		driver = await createDriver();
	});

	// Libère les ressources après le test.
	after(async function () {
		// Ferme le navigateur s'il a été créé.
		if (driver) await driver.quit();
		// Arrête uniquement le serveur démarré par ce fichier.
		if (serverProcess) serverProcess.kill('SIGTERM');
	});

	// Vérifie qu'un élément est attendu avant d'effectuer l'action suivante.
	it('attend explicitement le catalogue avant de sélectionner un produit', async function () {
		// Ouvre la page du catalogue.
		await driver.get(`${SHOPNOW_URL}/products.html`);
		// Attend la présence du premier produit au lieu d'utiliser une pause fixe.
		const productCard = await driver.wait(
			// Demande à Selenium de rechercher la carte produit.
			until.elementLocated(By.css('.product-card')),
			// Définit le délai maximal acceptable.
			10000,
			// Fournit un message utile en cas d'échec.
			'La carte produit n’est pas apparue dans le délai attendu'
		);
		// Vérifie que l'élément attendu est affiché.
		assert.strictEqual(await productCard.isDisplayed(), true);
		// Attend explicitement que le lien de détail soit cliquable.
		const viewButton = await driver.wait(
			// Recherche le lien de détail dans la carte chargée.
			until.elementLocated(By.css('[data-testid^="view-product-"]')),
			// Définit le délai maximal de recherche.
			10000,
			// Explique l'échec éventuel.
			'Le lien de détail n’est pas disponible'
		);
		// Vérifie que le lien peut être utilisé avant de cliquer.
		assert.strictEqual(await viewButton.isEnabled(), true);
		// Effectue l'action seulement après la réussite des attentes explicites.
		await viewButton.click();
		// Attend l'affichage de la page détail après la navigation.
		const productPage = await driver.wait(
			// Recherche l'identifiant de la page détail.
			until.elementLocated(By.css('[data-testid^="product-detail-"]')),
			// Définit le délai maximal de chargement.
			10000,
			// Explique l'échec éventuel.
			'La page détail ne s’est pas affichée'
		);
		// Vérifie que la page détail est bien visible.
		assert.strictEqual(await productPage.isDisplayed(), true);
	});
});
