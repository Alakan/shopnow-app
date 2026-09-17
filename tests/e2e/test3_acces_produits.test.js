// Importation des outils Selenium : Builder pour démarrer le navigateur,
// By pour trouver les éléments dans la page,
// until pour attendre qu'un élément soit visible avant de continuer.
const { Builder, By, until } = require('selenium-webdriver');

// Importation du module Chrome de Selenium pour configurer le navigateur Chrome.
const chrome = require('selenium-webdriver/chrome');

// Importation du module assert de Node.js pour faire les vérifications du test.
const assert = require('assert');

// Importation des modules Node.js utiles pour vérifier le serveur et enregistrer une capture d'écran.
const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

// Définition de l'URL de base de l'application.
// Si la variable d'environnement SHOPNOW_URL n'est pas définie, on utilise localhost:3000.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';
const APP_ROOT = path.resolve(__dirname, '../..');

// Fonction qui attend qu'un serveur réponde sur une URL donnée avant de continuer.
function waitForServer(url, timeoutMs = 20000) {
	// On retourne une promesse pour gérer l'attente de façon asynchrone.
	return new Promise((resolve, reject) => {
		// On mémorise le moment de départ pour calculer le délai maximum.
		const startedAt = Date.now();

		// Fonction qui essaie une connexion HTTP à l'URL demandée.
		const tryConnect = () => {
			// On lance une requête GET sur l'URL cible.
			const req = http.get(url, (res) => {
				// On vide le flux pour libérer la connection.
				res.resume();
				// On résout la promesse si le serveur répond.
				resolve();
			});

			// En cas d'erreur réseau, on retente après un court délai.
			req.on('error', () => {
				// Si le délai est dépassé, on rejette la promesse.
				if (Date.now() - startedAt > timeoutMs) {
					reject(new Error(`Le serveur n’a pas répondu sur ${url} dans le délai imparti.`));
					return;
				}
				// On attend un peu avant de retenter la connexion.
				setTimeout(tryConnect, 250);
			});

			// Si la requête prend trop de temps, on la détruit puis on retente.
			req.setTimeout(1000, () => {
				req.destroy();
				if (Date.now() - startedAt > timeoutMs) {
					reject(new Error(`Le serveur n’a pas répondu sur ${url} dans le délai imparti.`));
					return;
				}
				setTimeout(tryConnect, 250);
			});
		};

		// On lance la première tentative de connexion.
		tryConnect();
	});
}

// Cette fonction décrit le test de validation de l'accès au catalogue produits.
describe('Test 2 - Accès aux produits', function () {
	// On donne 30 secondes maximum pour l'exécution de ce test.
	this.timeout(30000);

	// Variable qui va contenir l'instance du navigateur Selenium.
	let driver;

	// Variable qui va contenir le processus du serveur s'il doit être démarré automatiquement.
	let serverProcess;

	// Avant de lancer le test, on prépare le navigateur et ses options.
	before(async function () {
		// On tente d'abord de vérifier si l'application est déjà disponible.
		try {
			// Si le serveur répond déjà, on ne fait rien.
			await waitForServer(SHOPNOW_URL, 2000);
		} catch {
			// Sinon, on démarre le serveur local de l'application.
			serverProcess = spawn('node', ['server.js'], {
				// On démarre le serveur depuis la racine du projet.
				cwd: APP_ROOT,
				// On ignore la sortie standard pour ne pas encombrer la console.
				stdio: 'ignore'
			});
			// On attend que le serveur soit disponible avant d'aller plus loin.
			await waitForServer(SHOPNOW_URL, 20000);
		}
		// On crée un objet de configuration Chrome.
		const chromeOptions = new chrome.Options().addArguments(
			// On démarre Chromium en mode headless pour ne pas afficher de fenêtre graphique.
			'--headless=new',
			// On autorise Chrome à s'exécuter avec les permissions du conteneur.
			'--no-sandbox',
			// On évite les problèmes de mémoire partagée dans le conteneur.
			'--disable-dev-shm-usage',
			// On désactive l'accélération GPU, inutile pour ce test automatique.
			'--disable-gpu'
		);

		// Si l'environnement fournit un chemin vers Chrome, on l'utilise.
		if (process.env.CHROME_BIN) {
			// On indique explicitement le binaire Chrome/Chromium à utiliser.
			chromeOptions.setChromeBinaryPath(process.env.CHROME_BIN);
		}

		// On construit le navigateur Chrome contrôlé par Selenium.
		driver = await new Builder()
			// On précise le navigateur à utiliser : Chrome.
			.forBrowser('chrome')
			// On applique les options de configuration définies plus haut.
			.setChromeOptions(chromeOptions)
			// On démarre effectivement le navigateur.
			.build();
	});

	// Après le test, on ferme le navigateur proprement pour libérer les ressources.
	after(async function () {
		// Si le navigateur a été créé, on le ferme.
		if (driver) {
			// La méthode quit() ferme la session Chrome.
			await driver.quit();
		}
		// Si on a démarré un serveur pour le test, on le tue proprement.
		if (serverProcess) {
			serverProcess.kill('SIGTERM');
		}
	});

	// Ce test vérifie que l'utilisateur peut ouvrir la page Produits et voir des produits.
	it('accède à la page Produits et affiche le catalogue', async function () {
		// On ouvre la page d'accueil de l'application pour commencer le parcours utilisateur.
		await driver.get(SHOPNOW_URL);

		// On attend que le lien de navigation vers la page Produits soit présent dans le DOM.
		const productsLink = await driver.wait(
			// On cherche un élément HTML correspondant au lien "Produits" via son data-testid.
			until.elementLocated(By.css('[data-testid="products-link"]')),
			// On attend max 10 secondes avant d'échouer si l'élément n'apparaît pas.
			10000,
			// Message affiché si le lien n'est pas trouvé.
			"Le lien vers la page Produits est introuvable"
		);

		// On clique sur le lien Produits pour simuler un utilisateur qui accède au catalogue.
		await productsLink.click();

		// On attend désormais que la page Produits soit bien affichée.
		const productsPage = await driver.wait(
			// On cherche le conteneur principal de la page Produits grâce à son data-testid.
			until.elementLocated(By.css('[data-testid="products-page"]')),
			// On attend 10 secondes maximum pour que la page soit chargée.
			10000,
			// Message affiché si la page produits n'est pas présente.
			'La page Produits est introuvable'
		);

		// Vérification 1 : on confirme que la page Produits est visible à l'écran.
		assert.strictEqual(await productsPage.isDisplayed(), true);

		// Vérification 2 : on vérifie que l'URL a bien changé vers la page produits.
		assert.match(await driver.getCurrentUrl(), /products\.html/i);

		// On attend qu'au moins un produit apparaisse dans le catalogue.
		await driver.wait(
			// On vérifie le nombre de cartes de produits chargées dans la page.
			async function () {
				// On récupère toutes les cartes produits actuellement visibles dans le DOM.
				const productCards = await driver.findElements(By.css('.product-card'));
				// On retourne true seulement si au moins un produit existe.
				return productCards.length > 0;
			},
			// On attend 10 secondes au maximum pour trouver des produits.
			10000,
			// Message affiché si le catalogue reste vide.
			'Aucun produit n’est présent dans le catalogue'
		);

		// On récupère maintenant les éléments produits affichés dans la page.
		const productCards = await driver.findElements(By.css('.product-card'));

		// Vérification minimale 3 : on vérifie qu'il y a bien au moins un produit dans le catalogue.
		assert.ok(productCards.length > 0, 'Aucun produit n’est présent dans le catalogue');

		// On crée le dossier de captures s'il n'existe pas.
		const screenshotDir = path.resolve(__dirname, '../../screenshots');
		// On crée le dossier avec les permissions nécessaires.
		fs.mkdirSync(screenshotDir, { recursive: true });
		// On choisit le nom du fichier image contenant la capture de la page produits.
		const screenshotPath = path.join(screenshotDir, 'products-page.png');
		// On enregistre une capture de la page courante en PNG.
		const image = await driver.takeScreenshot();
		// On écrit la capture dans le fichier local.
		fs.writeFileSync(screenshotPath, image, 'base64');
		// On affiche le chemin de la capture dans la console pour pouvoir la retrouver.
		console.log(`Capture sauvegardée : ${screenshotPath}`);
	});
});
