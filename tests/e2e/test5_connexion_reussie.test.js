// Importe les outils Selenium utilisés pour piloter le navigateur et rechercher des éléments.
const { Builder, By, until } = require('selenium-webdriver');
// Importe les options spécifiques à Chrome ou Chromium.
const chrome = require('selenium-webdriver/chrome');
// Importe le module d'assertions fourni par Node.js.
const assert = require('assert');

// Utilise l'URL passée dans l'environnement ou l'URL locale par défaut.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';

// Regroupe les vérifications concernant la connexion d'un utilisateur.
describe('Test 4 - Connexion réussie', function () {
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

	// Vérifie qu'un utilisateur peut se connecter avec les identifiants de démonstration.
	it('connecte l’utilisateur et l’identifie dans l’interface', async function () {
		// Ouvre la page de connexion de ShopNow.
		await driver.get(`${SHOPNOW_URL}/login.html`);

		// Vérifie que l'URL courante correspond à la page de connexion.
		assert.match(await driver.getCurrentUrl(), /login\.html/i);

		// Attend que le formulaire de connexion soit visible.
		const loginForm = await driver.wait(
			// Recherche le formulaire grâce à son identifiant de test.
			until.elementLocated(By.css('[data-testid="login-form"]')),
			// Attend au maximum dix secondes l'apparition du formulaire.
			10000,
			// Affiche ce message si le formulaire n'est pas trouvé.
			'Le formulaire de connexion est introuvable'
		);

		// Vérifie que la page de connexion est correctement affichée.
		assert.strictEqual(await loginForm.isDisplayed(), true);

		// Recherche le champ destiné à recevoir l'adresse e-mail.
		const emailField = await driver.findElement(By.css('[data-testid="login-email"]'));
		// Recherche le champ destiné à recevoir le mot de passe.
		const passwordField = await driver.findElement(By.css('[data-testid="login-password"]'));

		// Saisit l'adresse e-mail du compte de démonstration.
		await emailField.sendKeys('alice@shopnow.test');
		// Saisit le mot de passe du compte de démonstration.
		await passwordField.sendKeys('Password123!');

		// Vérifie que l'adresse e-mail a bien été saisie.
		assert.strictEqual(await emailField.getAttribute('value'), 'alice@shopnow.test');
		// Vérifie que le mot de passe a bien été saisi.
		assert.strictEqual(await passwordField.getAttribute('value'), 'Password123!');

		// Recherche le bouton qui valide le formulaire de connexion.
		const loginButton = await driver.findElement(By.css('[data-testid="login-submit"]'));
		// Soumet les informations saisies au serveur.
		await loginButton.click();

		// Attend la redirection vers l'accueil après une connexion réussie.
		await driver.wait(until.urlMatches(/\/$|index\.html/i), 10000);
		// Attend que l'utilisateur connecté soit affiché dans la barre de navigation.
		const loggedUser = await driver.wait(
			// Recherche l'élément qui identifie l'utilisateur connecté.
			until.elementLocated(By.css('[data-testid="logged-user"]')),
			// Attend au maximum dix secondes l'affichage du nom utilisateur.
			10000,
			// Affiche ce message si l'utilisateur connecté n'est pas identifiable.
			"L'utilisateur connecté n'est pas identifié dans l'interface"
		);

		// Vérifie que l'identifiant de l'utilisateur est visible.
		assert.strictEqual(await loggedUser.isDisplayed(), true);
		// Vérifie que l'interface affiche le prénom du compte connecté.
		assert.match(await loggedUser.getText(), /Bonjour Alice/i);
	});
});
