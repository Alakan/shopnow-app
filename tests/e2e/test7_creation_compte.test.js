// Importe les outils Selenium utilisés pour piloter le navigateur et rechercher des éléments.
const { Builder, By, until } = require('selenium-webdriver');
// Importe les options spécifiques à Chrome ou Chromium.
const chrome = require('selenium-webdriver/chrome');
// Importe le module d'assertions fourni par Node.js.
const assert = require('assert');

// Utilise l'URL passée dans l'environnement ou l'URL locale par défaut.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';

// Regroupe les vérifications concernant la création d'un compte utilisateur.
describe("Test 6 - Création d'un compte", function () {
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

	// Vérifie qu'un nouvel utilisateur peut remplir et envoyer le formulaire d'inscription.
	it('crée un compte avec une nouvelle adresse e-mail', async function () {
		// Ouvre la page d'inscription de ShopNow.
		await driver.get(`${SHOPNOW_URL}/register.html`);

		// Attend que le formulaire d'inscription soit disponible.
		const registerForm = await driver.wait(
			// Recherche le formulaire grâce à son identifiant de test.
			until.elementLocated(By.css('[data-testid="register-form"]')),
			// Attend au maximum dix secondes l'apparition du formulaire.
			10000,
			// Affiche ce message si le formulaire n'est pas trouvé.
			"Le formulaire d'inscription est introuvable"
		);

		// Vérifie que le formulaire d'inscription est visible.
		assert.strictEqual(await registerForm.isDisplayed(), true);

		// Crée une adresse unique afin de ne pas utiliser un compte existant.
		const uniqueEmail = `test-${Date.now()}@shopnow.test`;
		// Recherche le champ du prénom.
		const firstNameField = await driver.findElement(By.css('[data-testid="register-firstname"]'));
		// Recherche le champ du nom.
		const lastNameField = await driver.findElement(By.css('[data-testid="register-lastname"]'));
		// Recherche le champ de l'adresse e-mail.
		const emailField = await driver.findElement(By.css('[data-testid="register-email"]'));
		// Recherche le champ du mot de passe.
		const passwordField = await driver.findElement(By.css('[data-testid="register-password"]'));

		// Saisit le prénom du nouvel utilisateur.
		await firstNameField.sendKeys('Test');
		// Saisit le nom du nouvel utilisateur.
		await lastNameField.sendKeys('Selenium');
		// Saisit l'adresse e-mail unique.
		await emailField.sendKeys(uniqueEmail);
		// Saisit un mot de passe respectant la longueur minimale requise.
		await passwordField.sendKeys('Password123!');

		// Vérifie que l'adresse unique a bien été saisie.
		assert.strictEqual(await emailField.getAttribute('value'), uniqueEmail);
		// Vérifie que le mot de passe a bien été saisi.
		assert.strictEqual(await passwordField.getAttribute('value'), 'Password123!');

		// Recherche le bouton qui envoie le formulaire d'inscription.
		const registerButton = await driver.findElement(By.css('[data-testid="register-submit"]'));
		// Envoie les informations du nouvel utilisateur au serveur.
		await registerButton.click();

		// Attend que la zone de résultat affiche un message après l'envoi.
		const registerMessage = await driver.wait(
			// Recherche la zone utilisée pour afficher le résultat de l'inscription.
			until.elementLocated(By.css('[data-testid="register-message"]')),
			// Attend au maximum dix secondes la réponse du serveur.
			10000,
			// Affiche ce message si la zone de résultat n'est pas trouvée.
			"Le message d'inscription est introuvable"
		);

		// Attend que la zone de résultat contienne effectivement un texte.
		await driver.wait(
			// Vérifie que le texte du message n'est pas vide.
			async function () {
				// Récupère le texte affiché dans la zone de résultat.
				const messageText = await registerMessage.getText();
				// Retourne vrai dès qu'un message est présent.
				return messageText.trim().length > 0;
			},
			// Attend au maximum dix secondes l'affichage du résultat.
			10000,
			// Affiche ce message si le résultat reste vide.
			"Le résultat de l'inscription est vide"
		);

		// Vérifie que le message confirme la création du compte.
		assert.match(await registerMessage.getText(), /Compte créé avec succès/i);
		// Vérifie que le message utilise la classe visuelle de succès.
		assert.match(await registerMessage.getAttribute('class'), /success/i);

		// Attend la redirection vers la page de connexion après la création du compte.
		await driver.wait(until.urlMatches(/login\.html/i), 10000);
		// Vérifie que l'utilisateur est bien redirigé vers la connexion.
		assert.match(await driver.getCurrentUrl(), /login\.html/i);
	});
});
