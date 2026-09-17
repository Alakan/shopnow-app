// Importe les assertions de Node.js.
const assert = require('assert');
// Importe les outils communs de préparation du serveur et du navigateur.
const { SHOPNOW_URL, createDriver, startServerIfNeeded } = require('../support/test_setup');
// Importe le Page Object qui centralise les sélecteurs et actions de connexion.
const LoginPage = require('../pages/LoginPage');

// Décrit la version refactorisée du test de connexion.
describe('Test 15 - Connexion avec Page Object', function () {
	// Autorise trente secondes pour le scénario.
	this.timeout(30000);
	// Déclare la session Selenium.
	let driver;
	// Déclare le serveur éventuellement démarré.
	let serverProcess;

	// Prépare le serveur et le navigateur avant le test.
	before(async function () {
		// Vérifie que ShopNow est disponible.
		serverProcess = await startServerIfNeeded();
		// Crée Chrome avec la configuration commune.
		driver = await createDriver();
	});

	// Nettoie les ressources après le test.
	after(async function () {
		// Ferme le navigateur créé pour le test.
		if (driver) await driver.quit();
		// Arrête le serveur créé localement.
		if (serverProcess) serverProcess.kill('SIGTERM');
	});

	// Vérifie la connexion sans utiliser directement de sélecteur dans le scénario.
	it('connecte Alice grâce au Page Object LoginPage', async function () {
		// Construit l'objet représentant la page de connexion.
		const loginPage = new LoginPage(driver, SHOPNOW_URL);
		// Ouvre la page via l'action centralisée du Page Object.
		await loginPage.open();
		// Vérifie que la page de connexion est accessible.
		assert.match(await driver.getCurrentUrl(), /login\.html/i);
		// Exécute la saisie et la soumission via le Page Object.
		await loginPage.login('alice@shopnow.test', 'Password123!');
		// Attend l'utilisateur identifié dans l'interface.
		const loggedUser = await loginPage.waitForLoggedUser();
		// Vérifie que le compte connecté est bien Alice.
		assert.match(await loggedUser.getText(), /Bonjour Alice/i);
	});
});
