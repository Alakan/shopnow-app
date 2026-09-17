// Importe les sélecteurs et les attentes explicites Selenium.
const { By, until } = require('selenium-webdriver');

// Représente la page catalogue des produits.
class ProductsPage {
	// Reçoit la session Selenium et l'URL de l'application.
	constructor(driver, baseUrl) {
		// Conserve le navigateur pour les actions du catalogue.
		this.driver = driver;
		// Conserve l'URL de base de l'application.
		this.baseUrl = baseUrl;
	}

	// Ouvre le catalogue.
	async open() {
		// Navigue vers la page products.html.
		await this.driver.get(`${this.baseUrl}/products.html`);
	}

	// Attend et retourne la première carte produit.
	async waitForFirstProduct() {
		// Attend qu'une carte soit réellement présente après le chargement de l'API.
		return this.driver.wait(until.elementLocated(By.css('.product-card')), 10000, 'Le catalogue est vide');
	}

	// Ouvre le détail du premier produit.
	async openFirstProduct() {
		// Attend que le premier lien de détail soit disponible.
		const viewButton = await this.driver.wait(until.elementLocated(By.css('[data-testid^="view-product-"]')), 10000);
		// Ouvre la page de détail du produit.
		await viewButton.click();
	}

	// Ajoute le premier produit au panier.
	async addFirstProduct() {
		// Attend la carte contenant les contrôles du produit.
		const productCard = await this.waitForFirstProduct();
		// Recherche le bouton d'ajout dans cette carte.
		const addButton = await productCard.findElement(By.css('[data-testid^="add-to-cart-"]'));
		// Clique sur le bouton d'ajout.
		await addButton.click();
		// Attend puis accepte l'alerte de confirmation de l'application.
		const alert = await this.driver.wait(async () => {
			try { return await this.driver.switchTo().alert(); } catch { return false; }
		}, 10000, "L'alerte d'ajout est introuvable");
		// Ferme l'alerte pour poursuivre le scénario.
		await alert.accept();
	}
}

// Rend le Page Object disponible pour les scénarios.
module.exports = ProductsPage;
