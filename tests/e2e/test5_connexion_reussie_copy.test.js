// Importe le moteur Selenium qui permet de contrôler un navigateur web avec du code JavaScript.
const { Builder, By, until } = require('selenium-webdriver');
// Importe le module Chrome pour configurer les options de lancement du navigateur Chromium.
const chrome = require('selenium-webdriver/chrome');
// Importe les assertions de Node.js pour vérifier que les conditions du test sont bien respectées.
const assert = require('assert');
// Importe le module HTTP pour tester si le serveur de l'application répond avant de lancer le test.
const http = require('http');
// Importe le module fs pour créer un dossier de captures et enregistrer des images d'écran.
const fs = require('fs');
// Importe le module child_process pour démarrer le serveur de l'application si celui-ci n'est pas déjà lancé.
const { spawn } = require('child_process');
// Importe le module path pour manipuler les chemins de fichiers de manière fiable.
const path = require('path');

// Définit l'URL de base de l'application, ou utilise localhost:3000 si la variable d'environnement n'est pas fournie.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';
// Définit le chemin du dossier racine du projet pour démarrer le serveur Node.js depuis le bon emplacement.
const APP_ROOT = path.resolve(__dirname, '../..');

// Déclare une fonction asynchrone qui attend qu'un serveur HTTP réponde avant de poursuivre.
function waitForServer(url, timeoutMs = 20000) {
	// Retourne une promesse qui sera résolue lorsqu'un serveur répondra correctement.
	return new Promise((resolve, reject) => {
		// Enregistre le moment exact où la vérification a commencé pour calculer le timeout.
		const startedAt = Date.now();

		// Définition d'une fonction interne qui tente une requête HTTP GET sur l'URL donnée.
		const tryConnect = () => {
			// Lance une requête HTTP vers l'URL ciblée.
			const req = http.get(url, (res) => {
				// Vide le flux de la réponse pour libérer la connexion.
				res.resume();
				// Si le serveur répond, la promesse est résolue.
				resolve();
			});

			// Gère le cas où la requête échoue, par exemple parce que le serveur n'est pas encore démarré.
			req.on('error', () => {
				// Si le délai maximum est dépassé, la promesse est rejetée.
				if (Date.now() - startedAt > timeoutMs) {
					// Envoie une erreur explicite pour indiquer que l'application n'est pas accessible.
					reject(new Error(`Le serveur n’a pas répondu sur ${url} dans le délai imparti.`));
					// Arrête l'exécution de cette tentative.
					return;
				}
				// Sinon, on retente après un court délai pour attendre que le serveur se lance.
				setTimeout(tryConnect, 250);
			});

			// Si la requête prend trop de temps, on la détruit et on retente.
			req.setTimeout(1000, () => {
				// Détruit la requête si elle ne répond pas assez vite.
				req.destroy();
				// Vérifie si le timeout global est dépassé.
				if (Date.now() - startedAt > timeoutMs) {
					// Rejette la promesse avec un message clair.
					reject(new Error(`Le serveur n’a pas répondu sur ${url} dans le délai imparti.`));
					// Arrête l'exécution.
					return;
				}
				// Relance une tentative après une courte pause.
				setTimeout(tryConnect, 250);
			});
		};

		// Lancement immédiat de la première vérification de connexion.
		tryConnect();
	});
}

// Définit le groupe de test appelé "Test 4 — Connexion réussie".
describe('Test 4 — Connexion réussie', function () {
	// Autorise 30 secondes pour l'exécution de ce test afin de laisser le chargement du site et du formulaire.
	this.timeout(30000);

	// Déclare la variable qui contiendra l'instance du navigateur Selenium.
	let driver;
	// Déclare la variable qui contiendra le processus du serveur si on doit le lancer automatiquement.
	let serverProcess;

	// Avant le test, on vérifie que l'application est bien accessible et on démarre le serveur si nécessaire.
	before(async function () {
		// Tente de vérifier si le site est déjà lancé sur localhost:3000.
		try {
			// Attend que le serveur réponde sur l'URL de base de l'application.
			await waitForServer(SHOPNOW_URL, 2000);
		} catch {
			// Si le serveur ne répond pas, on le démarre automatiquement avec Node.js.
			serverProcess = spawn('node', ['server.js'], {
				// On exécute la commande depuis la racine du projet.
				cwd: APP_ROOT,
				// On ignore la sortie du serveur pour garder la console propre.
				stdio: 'ignore'
			});
			// Attend que le serveur soit réellement prêt avant de continuer.
			await waitForServer(SHOPNOW_URL, 20000);
		}

		// Crée un objet de configuration Chrome pour démarrer un navigateur sans interface graphique.
		const chromeOptions = new chrome.Options().addArguments(
			// Lance Chrome en mode headless moderne qui évite le besoin d'une vraie fenêtre graphique.
			'--headless=new',
			// Autorise le navigateur à fonctionner dans le conteneur sans restriction système.
			'--no-sandbox',
			// Évite les erreurs de mémoire partagée dans l'environnement de test.
			'--disable-dev-shm-usage',
			// Désactive l'accélération GPU, inutile pour ce test automatisé.
			'--disable-gpu'
		);

		// Si le système fournit un chemin vers Chrome/Chromium, on l'utilise pour éviter les erreurs de binaire.
		if (process.env.CHROME_BIN) {
			// Définit le chemin du navigateur Chrome ou Chromium à utiliser.
			chromeOptions.setChromeBinaryPath(process.env.CHROME_BIN);
		}

		// Construit une instance de navigateur Chrome contrôlée par Selenium.
		driver = await new Builder()
			// Indique que le navigateur à lancer est Chrome.
			.forBrowser('chrome')
			// Applique les options de Chrome définies ci-dessus.
			.setChromeOptions(chromeOptions)
			// Démarre effectivement le navigateur.
			.build();
	});

	// Après le test, on ferme le navigateur et on stoppe éventuellement le serveur lancé pour le test.
	after(async function () {
		// Vérifie que le navigateur a bien été initialisé.
		if (driver) {
			// Ferme proprement la session du navigateur.
			await driver.quit();
		}
		// Vérifie si le serveur de l'application a été démarré par le test.
		if (serverProcess) {
			// Tue le processus du serveur pour ne pas laisser un service tourner en arrière-plan.
			serverProcess.kill('SIGTERM');
		}
	});

	// Définit le cas de test principal : vérifier qu'un utilisateur peut se connecter avec un compte valide.
	it('connecte un utilisateur avec des identifiants valides', async function () {
		// Ouvre la page de connexion de l'application ShopNow.
		await driver.get(`${SHOPNOW_URL}/login.html`);

		// Vérifie que l'URL courante correspond bien à la page de connexion.
		assert.match(await driver.getCurrentUrl(), /login\.html/i);

		// Attend que le formulaire de connexion soit présent dans le DOM.
		const loginForm = await driver.wait(
			// Recherche le formulaire via son data-testid défini dans le HTML.
			until.elementLocated(By.css('[data-testid="login-form"]')),
			// Attends au maximum 10 secondes avant de considérer que le formulaire est absent.
			10000,
			// Message affiché si le formulaire n'est pas trouvé.
			'Le formulaire de connexion est introuvable'
		);

		// Vérifie que le formulaire est bien visible pour l'utilisateur.
		assert.strictEqual(await loginForm.isDisplayed(), true);

		// Trouve le champ de saisie de l'email du formulaire.
		const emailField = await driver.findElement(By.css('[data-testid="login-email"]'));
		// Trouve le champ de saisie du mot de passe du formulaire.
		const passwordField = await driver.findElement(By.css('[data-testid="login-password"]'));

		// Saisit l'email du compte de démonstration.
		await emailField.sendKeys('alice@shopnow.test');
		// Saisit le mot de passe du compte de démonstration.
		await passwordField.sendKeys('Password123!');

		// Vérifie que l'email saisi correspond bien à la donnée attendue.
		assert.strictEqual(await emailField.getAttribute('value'), 'alice@shopnow.test');
		// Vérifie que le mot de passe saisi correspond bien à la donnée attendue.
		assert.strictEqual(await passwordField.getAttribute('value'), 'Password123!');

		// Trouve le bouton de soumission du formulaire de connexion.
		const loginButton = await driver.findElement(By.css('[data-testid="login-submit"]'));
		// Clique sur le bouton pour envoyer le formulaire.
		await loginButton.click();

		// Attend que l'application redirige correctement vers la page d'accueil après une connexion réussie.
		await driver.wait(until.urlMatches(/\/$|index\.html/i), 10000);

		// Attend que l'élément identifiant l'utilisateur connecté soit présent dans l'interface.
		const loggedUser = await driver.wait(
			// Recherche l'élément qui affiche le nom de l'utilisateur connecté.
			until.elementLocated(By.css('[data-testid="logged-user"]')),
			// Attends jusqu'à 10 secondes avant d'échouer.
			10000,
			// Message affiché si l'utilisateur connecté n'apparaît pas.
			"L'utilisateur connecté n'est pas identifiable dans l'interface"
		);

		// Vérifie que l'utilisateur connecté est bien affiché visuellement.
		assert.strictEqual(await loggedUser.isDisplayed(), true);
		// Vérifie que le texte affiché contient le prénom attendu de l'utilisateur Alice.
		assert.match(await loggedUser.getText(), /Bonjour Alice/i);

		// Prépare le dossier qui contiendra les captures d'écran de validation.
		const screenshotDir = path.resolve(__dirname, '../../screenshots');
		// Crée le dossier s'il n'existe pas déjà.
		fs.mkdirSync(screenshotDir, { recursive: true });
		// Définit le nom du fichier de capture pour conserver une preuve visuelle du test.
		const screenshotPath = path.join(screenshotDir, 'connexion-reussie.png');
		// Enregistre une capture de la page de l'application après la connexion.
		const image = await driver.takeScreenshot();
		// Écrit le fichier PNG sur le disque.
		fs.writeFileSync(screenshotPath, image, 'base64');
		// Affiche le chemin du fichier pour pouvoir le vérifier dans le dossier screenshots.
		console.log(`Capture sauvegardée : ${screenshotPath}`);
	});
});
