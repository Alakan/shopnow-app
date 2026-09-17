// Importe les sélecteurs Selenium utilisés par cette page.
const { By, until } = require('selenium-webdriver');

// Représente la page de connexion ShopNow.
class LoginPage {
	// Reçoit la session Selenium et l'URL de l'application.
	constructor(driver, baseUrl) {
		// Conserve le navigateur pour exécuter les actions.
		this.driver = driver;
		// Conserve l'URL de base pour ouvrir la page.
		this.baseUrl = baseUrl;
	}

	// Ouvre la page de connexion.
	async open() {
		// Navigue vers le fichier login.html.
		await this.driver.get(`${this.baseUrl}/login.html`);
	}

	// Attend que le formulaire soit disponible.
	async waitUntilDisplayed() {
		// Attend la présence du formulaire grâce à son data-testid.
		return this.driver.wait(until.elementLocated(By.css('[data-testid="login-form"]')), 10000);
	}

	// Remplit et envoie le formulaire de connexion.
	async login(email, password) {
		// Attend que le formulaire soit chargé avant toute saisie.
		await this.waitUntilDisplayed();
		// Recherche le champ email.
		const emailField = await this.driver.findElement(By.css('[data-testid="login-email"]'));
		// Recherche le champ mot de passe.
		const passwordField = await this.driver.findElement(By.css('[data-testid="login-password"]'));
		// Saisit l'adresse email fournie par le scénario.
		await emailField.sendKeys(email);
		// Saisit le mot de passe fourni par le scénario.
		await passwordField.sendKeys(password);
		// Recherche le bouton de validation.
		const submitButton = await this.driver.findElement(By.css('[data-testid="login-submit"]'));
		// Envoie le formulaire.
		await submitButton.click();
	}

	// Attend qu'un utilisateur connecté apparaisse sur la page d'accueil.
	async waitForLoggedUser() {
		// Attend la redirection et l'identification de l'utilisateur.
		return this.driver.wait(until.elementLocated(By.css('[data-testid="logged-user"]')), 10000);
	}
}

// Rend le Page Object disponible pour les scénarios.
module.exports = LoginPage;
