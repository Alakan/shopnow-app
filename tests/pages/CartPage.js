// Importe les sélecteurs et les attentes explicites Selenium.
const { By, until } = require('selenium-webdriver');

// Représente la page du panier ShopNow.
class CartPage {
	// Reçoit la session Selenium et l'URL de l'application.
	constructor(driver, baseUrl) {
		// Conserve le navigateur pour agir sur le panier.
		this.driver = driver;
		// Conserve l'URL de base de l'application.
		this.baseUrl = baseUrl;
	}

	// Ouvre le panier.
	async open() {
		// Navigue vers la page cart.html.
		await this.driver.get(`${this.baseUrl}/cart.html`);
	}

	// Attend et retourne le premier article du panier.
	async waitForFirstItem() {
		// Attend le rendu de l'article créé par cart.js.
		return this.driver.wait(until.elementLocated(By.css('.cart-item')), 10000, 'Le panier ne contient aucun produit');
	}

	// Lit la quantité du premier article.
	async getFirstQuantity() {
		// Attend l'article avant de rechercher sa quantité.
		const item = await this.waitForFirstItem();
		// Retourne la quantité affichée sous forme de nombre.
		return Number(await item.findElement(By.css('[data-testid^="quantity-"]')).getText());
	}

	// Augmente la quantité du premier article et attend le nouveau rendu.
	async increaseFirstQuantity() {
		// Recherche l'article courant.
		const item = await this.waitForFirstItem();
		// Clique sur le bouton d'augmentation.
		await item.findElement(By.css('[data-action="increase"]')).click();
		// Attend que la quantité soit effectivement mise à jour.
		await this.driver.wait(async () => (await this.getFirstQuantity()) === 2, 10000, 'La quantité ne vaut pas deux');
	}

	// Lit le total affiché dans le panier.
	async getTotalText() {
		// Attend la présence de l'élément total.
		const total = await this.driver.wait(until.elementLocated(By.css('[data-testid="cart-total"]')), 10000);
		// Retourne le montant affiché.
		return total.getText();
	}

	// Supprime le premier article du panier.
	async removeFirstItem() {
		// Recherche l'article à supprimer.
		const item = await this.waitForFirstItem();
		// Clique sur le bouton Supprimer.
		await item.findElement(By.css('[data-action="remove"]')).click();
		// Attend l'état panier vide après le rendu.
		return this.driver.wait(until.elementLocated(By.css('[data-testid="empty-cart"]')), 10000, 'Le panier ne devient pas vide');
	}
}

// Rend le Page Object disponible pour les scénarios.
module.exports = CartPage;
