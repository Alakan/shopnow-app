// Importe les outils Selenium utilisés pour piloter le navigateur et rechercher des éléments.
const { Builder, By, until } = require('selenium-webdriver');
// Importe les options spécifiques à Chrome ou Chromium.
const chrome = require('selenium-webdriver/chrome');
// Importe le module d'assertions fourni par Node.js.
const assert = require('assert');

// Utilise l'URL passée dans l'environnement ou l'URL locale par défaut.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';

// Regroupe les vérifications concernant le calcul du total du panier.
describe('Test 9 - Calcul du total', function () {
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

	// Vérifie que le total du panier correspond au prix multiplié par la quantité.
	it('calcule correctement le montant total du panier', async function () {
		// Ouvre la page d'accueil pour établir l'origine du site.
		await driver.get(SHOPNOW_URL);
		// Supprime un éventuel ancien panier pour commencer avec un seul produit.
		await driver.executeScript('window.localStorage.removeItem("shopnow_cart");');
		// Ouvre la page Produits de ShopNow.
		await driver.get(`${SHOPNOW_URL}/products.html`);

		// Attend que le premier produit soit chargé dans le catalogue.
		const productCard = await driver.wait(
			// Recherche la première carte générée par le catalogue.
			until.elementLocated(By.css('.product-card')),
			// Attend au maximum dix secondes le chargement du produit.
			10000,
			// Affiche ce message si aucun produit n'est chargé.
			'Aucun produit n’est affiché dans le catalogue'
		);

		// Récupère le texte du prix du produit sélectionné.
		const displayedPrice = await productCard.findElement(By.css('.price')).getText();
		// Convertit le prix français affiché en valeur numérique exploitable par le test.
		const unitPrice = Number(displayedPrice.replace(/[^\d,.-]/g, '').replace(',', '.'));
		// Vérifie que le prix récupéré est bien un nombre positif.
		assert.ok(unitPrice > 0, 'Le prix du produit doit être supérieur à zéro');

		// Recherche le bouton d'ajout du premier produit.
		const addButton = await productCard.findElement(By.css('[data-testid^="add-to-cart-"]'));
		// Ajoute le produit au panier avec une quantité initiale de un.
		await addButton.click();

		// Attend l'alerte de confirmation déclenchée par l'ajout au panier.
		const addAlert = await driver.wait(
			// Essaie de récupérer l'alerte actuellement ouverte.
			async function () {
				// Retourne l'alerte si elle existe.
				try {
					// Récupère l'alerte affichée par l'application.
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

		// Ouvre la page du panier pour vérifier le calcul du total.
		await driver.get(`${SHOPNOW_URL}/cart.html`);

		// Attend qu'un produit soit présent dans le panier.
		let cartItem = await driver.wait(
			// Recherche le premier article présent dans le panier.
			until.elementLocated(By.css('.cart-item')),
			// Attend au maximum dix secondes l'affichage de l'article.
			10000,
			// Affiche ce message si le produit n'est pas retrouvé.
			'Le panier ne contient aucun produit'
		);

		// Définit la quantité du produit à deux en cliquant sur le bouton d'augmentation.
		const increaseButton = await cartItem.findElement(By.css('[data-action="increase"]'));
		// Augmente la quantité du produit d'une unité.
		await increaseButton.click();

		// Attend que le rendu du panier indique une quantité de deux.
		await driver.wait(
			// Vérifie la quantité affichée après le clic.
			async function () {
				// Récupère l'article après le nouveau rendu HTML.
				cartItem = await driver.findElement(By.css('.cart-item'));
				// Retourne vrai lorsque la quantité affichée vaut deux.
				return (await cartItem.findElement(By.css('[data-testid^="quantity-"]')).getText()) === '2';
			},
			// Attend au maximum dix secondes la mise à jour de la quantité.
			10000,
			// Affiche ce message si la quantité ne devient pas deux.
			'La quantité du produit n’est pas égale à deux'
		);

		// Récupère la quantité affichée dans le panier.
		const quantity = Number(await cartItem.findElement(By.css('[data-testid^="quantity-"]')).getText());
		// Vérifie que la quantité utilisée pour le calcul est bien deux.
		assert.strictEqual(quantity, 2);

		// Calcule le total attendu à partir du prix unitaire et de la quantité.
		const expectedTotal = unitPrice * quantity;
		// Attend que le total soit présent dans le panier.
		const totalElement = await driver.wait(
			// Recherche l'élément qui affiche le montant total.
			until.elementLocated(By.css('[data-testid="cart-total"]')),
			// Attend au maximum dix secondes l'affichage du total.
			10000,
			// Affiche ce message si le total n'est pas trouvé.
			'Le montant total est introuvable'
		);

		// Récupère le texte du total affiché dans le panier.
		const displayedTotal = await totalElement.getText();
		// Convertit le total affiché au format français en valeur numérique.
		const actualTotal = Number(displayedTotal.replace(/[^\d,.-]/g, '').replace(',', '.'));
		// Compare le résultat fonctionnel au calcul attendu avec une précision au centime.
		assert.strictEqual(Number(actualTotal.toFixed(2)), Number(expectedTotal.toFixed(2)));
	});
});
