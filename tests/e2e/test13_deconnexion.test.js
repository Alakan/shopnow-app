// Importe les outils Selenium utilisés pour piloter le navigateur et rechercher des éléments.
const { Builder, By, until } = require('selenium-webdriver');
// Importe les options spécifiques à Chrome ou Chromium.
const chrome = require('selenium-webdriver/chrome');
// Importe le module d'assertions fourni par Node.js.
const assert = require('assert');

// Utilise l'URL passée dans l'environnement ou l'URL locale par défaut.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';

// Regroupe les vérifications concernant la déconnexion d'un utilisateur.
describe('Test 12 - Déconnexion', function () {
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

	// Vérifie qu'un utilisateur connecté peut se déconnecter.
	it('déconnecte l’utilisateur et rétablit l’état non connecté', async function () {
		// Ouvre l'accueil pour établir l'origine du site.
		await driver.get(SHOPNOW_URL);
		// Supprime une éventuelle ancienne session pour commencer avec un état contrôlé.
		await driver.executeScript('window.localStorage.removeItem("shopnow_user");');
		// Ouvre la page de connexion.
		await driver.get(`${SHOPNOW_URL}/login.html`);

		// Attend que le formulaire de connexion soit disponible.
		const loginForm = await driver.wait(
			// Recherche le formulaire grâce à son identifiant de test.
			until.elementLocated(By.css('[data-testid="login-form"]')),
			// Attend au maximum dix secondes l'apparition du formulaire.
			10000,
			// Affiche ce message si le formulaire n'est pas trouvé.
			'Le formulaire de connexion est introuvable'
		);

		// Vérifie que le formulaire de connexion est visible.
		assert.strictEqual(await loginForm.isDisplayed(), true);
		// Recherche le champ de l'adresse e-mail.
		const emailField = await driver.findElement(By.css('[data-testid="login-email"]'));
		// Recherche le champ du mot de passe.
		const passwordField = await driver.findElement(By.css('[data-testid="login-password"]'));
		// Saisit l'adresse e-mail du compte de démonstration.
		await emailField.sendKeys('alice@shopnow.test');
		// Saisit le mot de passe du compte de démonstration.
		await passwordField.sendKeys('Password123!');
		// Soumet le formulaire de connexion.
		await driver.findElement(By.css('[data-testid="login-submit"]')).click();

		// Attend la redirection vers l'accueil après la connexion.
		await driver.wait(until.urlMatches(/\/$|index\.html/i), 10000);
		// Attend l'affichage de l'utilisateur connecté.
		const loggedUser = await driver.wait(
			// Recherche l'identifiant de l'utilisateur connecté.
			until.elementLocated(By.css('[data-testid="logged-user"]')),
			// Attend au maximum dix secondes l'affichage de l'utilisateur.
			10000,
			// Affiche ce message si l'utilisateur n'est pas identifié.
			"L'utilisateur connecté n'est pas identifié"
		);

		// Vérifie que l'utilisateur est bien identifié avant la déconnexion.
		assert.strictEqual(await loggedUser.isDisplayed(), true);
		// Recherche le bouton de déconnexion.
		const logoutButton = await driver.findElement(By.css('[data-testid="logout-button"]'));
		// Déconnecte l'utilisateur.
		await logoutButton.click();

		// Attend la redirection vers l'accueil après la déconnexion.
		await driver.wait(until.urlMatches(/\/$|index\.html/i), 10000);
		// Attend le retour du lien de connexion.
		const loginLink = await driver.wait(
			// Recherche le lien destiné aux utilisateurs non connectés.
			until.elementLocated(By.css('[data-testid="login-link"]')),
			// Attend au maximum dix secondes le rendu de l'état non connecté.
			10000,
			// Affiche ce message si le lien de connexion n'est pas affiché.
			'Le lien de connexion ne réapparaît pas après la déconnexion'
		);

		// Vérifie que le lien de connexion est visible.
		assert.strictEqual(await loginLink.isDisplayed(), true);
		// Vérifie qu'aucun identifiant d'utilisateur connecté ne reste dans l'interface.
		assert.strictEqual((await driver.findElements(By.css('[data-testid="logged-user"]'))).length, 0);
		// Vérifie que le stockage local ne contient plus la session utilisateur.
		assert.strictEqual(await driver.executeScript('return window.localStorage.getItem("shopnow_user");'), null);
	});
});
