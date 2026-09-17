// Importe les sélecteurs et les attentes nécessaires au scénario.
const { By, until } = require('selenium-webdriver');
// Importe les assertions de Node.js.
const assert = require('assert');
// Importe les outils communs de préparation du navigateur et du serveur.
const { SHOPNOW_URL, createDriver, startServerIfNeeded } = require('../support/test_setup');
// Importe le Page Object de connexion.
const LoginPage = require('../pages/LoginPage');
// Importe le Page Object du catalogue.
const ProductsPage = require('../pages/ProductsPage');
// Importe le Page Object du panier.
const CartPage = require('../pages/CartPage');

// Décrit le parcours utilisateur complet de ShopNow.
describe('Test 14 - Parcours utilisateur complet', function () {
	// Autorise une minute pour toutes les pages et actions du parcours.
	this.timeout(60000);
	// Déclare la session du navigateur.
	let driver;
	// Déclare le serveur éventuellement démarré par le test.
	let serverProcess;

	// Prépare les dépendances avant le scénario.
	before(async function () {
		// Garantit que l'application est accessible.
		serverProcess = await startServerIfNeeded();
		// Crée le navigateur automatisé.
		driver = await createDriver();
	});

	// Ferme les ressources après le scénario.
	after(async function () {
		// Ferme Chrome si la session existe.
		if (driver) await driver.quit();
		// Arrête le serveur lancé localement.
		if (serverProcess) serverProcess.kill('SIGTERM');
	});

	// Exécute le parcours complet demandé.
	it('réalise le parcours de la connexion au panier vide', async function () {
		// Supprime l'ancien panier pour garantir un état initial reproductible.
		await driver.get(SHOPNOW_URL);
		// Réinitialise le stockage du panier dans le navigateur.
		await driver.executeScript('window.localStorage.removeItem("shopnow_cart");');
		// Crée l'objet représentant la page de connexion.
		const loginPage = new LoginPage(driver, SHOPNOW_URL);
		// Crée l'objet représentant la page des produits.
		const productsPage = new ProductsPage(driver, SHOPNOW_URL);
		// Crée l'objet représentant la page du panier.
		const cartPage = new CartPage(driver, SHOPNOW_URL);

		// Ouvre la page de connexion.
		await loginPage.open();
		// Vérifie que l'URL de connexion est correcte.
		assert.match(await driver.getCurrentUrl(), /login\.html/i);
		// Saisit les identifiants et valide la connexion via le Page Object.
		await loginPage.login('alice@shopnow.test', 'Password123!');
		// Attend que l'utilisateur connecté soit visible.
		const loggedUser = await loginPage.waitForLoggedUser();
		// Vérifie que le compte Alice est identifié dans l'interface.
		assert.match(await loggedUser.getText(), /Bonjour Alice/i);

		// Ouvre la page des produits.
		await productsPage.open();
		// Attend la première carte grâce à une attente explicite.
		const productCard = await productsPage.waitForFirstProduct();
		// Vérifie que le catalogue contient un produit visible.
		assert.strictEqual(await productCard.isDisplayed(), true);
		// Ouvre le détail du premier produit.
		await productsPage.openFirstProduct();
		// Attend le nom du produit généré par product.js.
		const productName = await driver.wait(until.elementLocated(By.css('[data-testid="product-name"]')), 10000);
		// Vérifie que le détail contient un nom non vide.
		assert.ok((await productName.getText()).trim().length > 0);
		// Attend le prix du produit pour calculer le total attendu.
		const productPrice = await driver.wait(until.elementLocated(By.css('[data-testid="product-price"]')), 10000);
		// Convertit le prix affiché au format français en nombre.
		const unitPrice = Number((await productPrice.getText()).replace(/[^\d,.-]/g, '').replace(',', '.'));
		// Vérifie que le prix est exploitable.
		assert.ok(unitPrice > 0);

		// Ajoute le produit depuis sa page détail.
		await driver.findElement(By.css('[data-testid^="add-to-cart-"]')).click();
		// Attend l'alerte de confirmation d'ajout.
		const addAlert = await driver.wait(async () => {
			try { return await driver.switchTo().alert(); } catch { return false; }
		}, 10000, "L'alerte d'ajout n'est pas apparue");
		// Ferme l'alerte pour poursuivre le parcours.
		await addAlert.accept();
		// Vérifie que le compteur de panier indique un produit.
		assert.strictEqual(await driver.findElement(By.css('#cart-count')).getText(), '1');

		// Ouvre la page du panier.
		await cartPage.open();
		// Attend l'article dans le panier.
		const cartItem = await cartPage.waitForFirstItem();
		// Vérifie que l'article ajouté est visible.
		assert.strictEqual(await cartItem.isDisplayed(), true);
		// Augmente la quantité à deux via le Page Object.
		await cartPage.increaseFirstQuantity();
		// Vérifie que la quantité affichée vaut deux.
		assert.strictEqual(await cartPage.getFirstQuantity(), 2);
		// Lit le total après modification de la quantité.
		const totalText = await cartPage.getTotalText();
		// Convertit le total affiché en nombre.
		const actualTotal = Number(totalText.replace(/[^\d,.-]/g, '').replace(',', '.'));
		// Vérifie le calcul du total pour deux unités.
		assert.strictEqual(Number(actualTotal.toFixed(2)), Number((unitPrice * 2).toFixed(2)));
		// Supprime le produit du panier.
		const emptyCart = await cartPage.removeFirstItem();
		// Vérifie que l'état panier vide est visible.
		assert.strictEqual(await emptyCart.isDisplayed(), true);
		// Vérifie qu'aucun article ne reste dans le panier.
		assert.strictEqual((await driver.findElements(By.css('.cart-item'))).length, 0);
	});
});
