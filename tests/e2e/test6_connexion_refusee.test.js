// Importe les outils Selenium utilisés pour piloter le navigateur et rechercher des éléments.
const { Builder, By, until } = require('selenium-webdriver');
// Importe les options spécifiques à Chrome ou Chromium.
const chrome = require('selenium-webdriver/chrome');
// Importe le module d'assertions fourni par Node.js.
const assert = require('assert');

// Utilise l'URL passée dans l'environnement ou l'URL locale par défaut.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';

// Regroupe les vérifications concernant une connexion refusée.
describe('Test 5 - Connexion refusée', function () {
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

	// Vérifie qu'une tentative avec un mauvais mot de passe est refusée.
	it('refuse la connexion et affiche un message d’erreur', async function () {
		// Ouvre la page de connexion de ShopNow.
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

		// Vérifie que la tentative peut être effectuée depuis le formulaire visible.
		assert.strictEqual(await loginForm.isDisplayed(), true);

		// Recherche le champ destiné à recevoir l'adresse e-mail.
		const emailField = await driver.findElement(By.css('[data-testid="login-email"]'));
		// Recherche le champ destiné à recevoir le mauvais mot de passe.
		const passwordField = await driver.findElement(By.css('[data-testid="login-password"]'));

		// Saisit l'adresse e-mail du compte existant.
		await emailField.sendKeys('alice@shopnow.test');
		// Saisit un mot de passe volontairement incorrect.
		await passwordField.sendKeys('MauvaisMotDePasse123!');

		// Recherche le bouton qui soumet la tentative de connexion.
		const loginButton = await driver.findElement(By.css('[data-testid="login-submit"]'));
		// Envoie les identifiants incorrects au serveur.
		await loginButton.click();

		// Attend que le message de réponse soit présent après la tentative.
		const loginMessage = await driver.wait(
			// Recherche la zone utilisée pour afficher le résultat de la connexion.
			until.elementLocated(By.css('[data-testid="login-message"]')),
			// Attend au maximum dix secondes la réponse du serveur.
			10000,
			// Affiche ce message si aucune réponse n'est affichée.
			'Le message de résultat de connexion est introuvable'
		);

		// Attend que la zone de message contienne effectivement une réponse.
		await driver.wait(
			// Vérifie que le texte du message n'est pas vide.
			async function () {
				// Récupère le texte affiché dans la zone de résultat.
				const messageText = await loginMessage.getText();
				// Retourne vrai dès qu'un message est présent.
				return messageText.trim().length > 0;
			},
			// Attend au maximum dix secondes l'affichage du texte d'erreur.
			10000,
			// Affiche ce message si la réponse reste vide.
			'Le message d’erreur de connexion est vide'
		);

		// Vérifie que la connexion reste refusée sur la page de connexion.
		assert.match(await driver.getCurrentUrl(), /login\.html/i);
		// Vérifie que la zone de message possède la classe indiquant une erreur.
		assert.match(await loginMessage.getAttribute('class'), /error/i);
		// Vérifie que le message informe l'utilisateur de l'échec de connexion.
		assert.match(await loginMessage.getText(), /incorrect|incorrecte|erreur/i);
	});
});
