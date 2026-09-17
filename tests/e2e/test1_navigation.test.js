// Importe les outils Selenium nécessaires pour créer un navigateur, cibler des éléments et attendre des conditions.
const { Builder, By, until } = require('selenium-webdriver');
// Importe la configuration spécifique à Chrome et Chromium.
const chrome = require('selenium-webdriver/chrome');
// Importe le module d'assertions intégré à Node.js.
const assert = require('assert');

// Utilise l'URL fournie par l'environnement ou l'URL locale par défaut.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';

// Regroupe les tests qui vérifient la navigation dans ShopNow.
describe('Navigation ShopNow', function () {
	// Autorise chaque test à durer au maximum 30 secondes.
	this.timeout(30000);

	// Déclare la variable qui contiendra le navigateur Selenium.
	let driver;

	// Exécute cette préparation avant tous les tests du groupe.
	before(async function () {
		// Configure Chromium pour fonctionner sans interface graphique dans le conteneur.
		const chromeOptions = new chrome.Options().addArguments(
			'--headless=new',
			'--no-sandbox',
			'--disable-dev-shm-usage',
			'--disable-gpu'
		);
		// Utilise un binaire fourni par l'environnement lorsqu'il n'est pas installé dans le PATH.
		if (process.env.CHROME_BIN) {
			chromeOptions.setChromeBinaryPath(process.env.CHROME_BIN);
		}
		// Crée une instance de Chrome contrôlée par Selenium avec cette configuration.
		driver = await new Builder()
			.forBrowser('chrome')
			.setChromeOptions(chromeOptions)
			.build();
	});

	// Exécute ce nettoyage après tous les tests du groupe.
	after(async function () {
		// Ferme le navigateur uniquement s'il a bien été créé.
		if (driver) await driver.quit();
	});

	// Vérifie l'ouverture de l'application et l'accès à la page de connexion.
	it('ouvre ShopNow, accède à la connexion et affiche correctement la page', async function () {
		// Ouvre la page d'accueil de ShopNow.
		await driver.get(SHOPNOW_URL);

		// Attend que le lien ou le bouton de connexion apparaisse dans la page.
		const loginLink = await driver.wait(
			// Recherche plusieurs sélecteurs possibles selon le balisage utilisé.
			until.elementLocated(
				By.css('a[href*="login"], a[href*="connexion"], button[data-testid="login"]')
			),
			// Abandonne l'attente après dix secondes si aucun élément n'est trouvé.
			10000,
			// Affiche ce message si le lien de connexion reste introuvable.
			'Le lien vers la page de connexion est introuvable'
		);
		// Clique sur le lien ou le bouton de connexion trouvé.
		await loginLink.click();

		// Attend que l'URL contienne un indicateur de page de connexion.
		await driver.wait(until.urlMatches(/login|connexion/i), 10000);
		// Vérifie que l'URL courante correspond bien à la page de connexion.
		assert.match(
			// Récupère l'URL actuellement affichée dans le navigateur.
			await driver.getCurrentUrl(),
			// Accepte les variantes anglaise ou française de l'URL.
			/login|connexion/i,
			// Message affiché si l'URL ne correspond pas à la page attendue.
			'L’URL affichée ne correspond pas à la page de connexion'
		);

		// Attend la présence du titre principal de la page de connexion.
		const loginHeading = await driver.wait(
			// Recherche un titre HTML ou l'élément possédant l'identifiant de test prévu.
			until.elementLocated(By.css('h1, h2, [data-testid="login-title"]')),
			// Abandonne l'attente après dix secondes si le titre est absent.
			10000,
			// Message affiché si le titre n'est pas trouvé.
			'Le titre de la page de connexion est introuvable'
		);
		// Vérifie que le texte du titre décrit bien la connexion.
		assert.match(
			// Récupère le texte du titre et le convertit en minuscules.
			(await loginHeading.getText()).toLowerCase(),
			// Accepte les formulations française ou anglaise du titre.
			/connexion|se connecter|login/,
			// Message affiché si le titre ne correspond pas à la page attendue.
			'La page affichée ne correspond pas à la page de connexion'
		);

		// Recherche le champ destiné à recevoir l'adresse e-mail ou l'identifiant.
		const emailField = await driver.findElement(
			// Accepte les attributs couramment utilisés pour ce champ.
			By.css('input[type="email"], input[name="email"], input[name="username"]')
		);
		// Recherche le champ de saisie du mot de passe.
		const passwordField = await driver.findElement(By.css('input[type="password"]'));
		// Vérifie que le champ e-mail est visible pour l'utilisateur.
		assert.strictEqual(await emailField.isDisplayed(), true);
		// Vérifie que le champ mot de passe est visible pour l'utilisateur.
		assert.strictEqual(await passwordField.isDisplayed(), true);
	});
});
