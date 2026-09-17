// Importation des outils Selenium : Builder pour démarrer le navigateur,
// By pour sélectionner les éléments HTML dans la page,
// until pour attendre qu'un élément soit présent ou visible.
const { Builder, By, until } = require('selenium-webdriver');

// Importation du module Chrome de Selenium pour configurer le navigateur Chrome.
const chrome = require('selenium-webdriver/chrome');

// Importation du module assert de Node.js pour valider les conditions du test.
const assert = require('assert');

// Importation des modules Node.js nécessaires pour vérifier la disponibilité du serveur et enregistrer une capture d'écran.
const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

// Définition de l'URL de base de l'application ShopNow.
// Si la variable d'environnement SHOPNOW_URL n'est pas définie, on utilise localhost:3000.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';

// Chemin du dossier racine du projet pour démarrer le serveur si besoin.
const APP_ROOT = path.resolve(__dirname, '../..');

// Fonction qui attend qu'un serveur HTTP soit disponible sur une URL précise.
function waitForServer(url, timeoutMs = 20000) {
	// On retourne une promesse pour gérer l'attente de manière asynchrone.
	return new Promise((resolve, reject) => {
		// On mémorise le moment de départ pour calculer le délai total.
		const startedAt = Date.now();

		// Fonction qui tente une requête HTTP GET sur la page cible.
		const tryConnect = () => {
			// On lance une requête vers l'URL demandée.
			const req = http.get(url, (res) => {
				// On vide le flux de réponse pour libérer la connexion.
				res.resume();
				// Si la requête répond, le serveur est bien disponible.
				resolve();
			});

			// Si la requête échoue, on réessaie tant que le temps n'est pas écoulé.
			req.on('error', () => {
				// Si le délai maximum est dépassé, on rejette la promesse.
				if (Date.now() - startedAt > timeoutMs) {
					reject(new Error(`Le serveur n’a pas répondu sur ${url} dans le délai imparti.`));
					return;
				}
				// On retente une nouvelle connexion après un petit délai.
				setTimeout(tryConnect, 250);
			});

			// Si la requête est trop lente, on la détruit et on retente.
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

// Description du test : vérification du détail d'un produit sélectionné.
describe('Test 3 - Détail d\'un produit', function () {
	// On autorise 30 secondes maximum pour l'exécution de ce test.
	this.timeout(30000);

	// Variable qui contiendra l'instance du navigateur Selenium.
	let driver;

	// Variable qui contiendra le processus du serveur si on le démarre automatiquement.
	let serverProcess;

	// Avant de lancer le test, on prépare le navigateur et on vérifie que le serveur fonctionne.
	before(async function () {
		// On tente d'abord de vérifier si l'application est déjà démarrée.
		try {
			// Si le site répond déjà, on ne démarre pas de serveur supplémentaire.
			await waitForServer(SHOPNOW_URL, 2000);
		} catch {
			// Sinon, on démarre le serveur Node.js de l'application.
			serverProcess = spawn('node', ['server.js'], {
				// On lance le serveur depuis la racine du projet.
				cwd: APP_ROOT,
				// On ignore la sortie du serveur pour garder la console claire.
				stdio: 'ignore'
			});
			// On attend que le serveur soit bien prêt avant de continuer.
			await waitForServer(SHOPNOW_URL, 20000);
		}

		// On crée un objet de configuration Chrome.
		const chromeOptions = new chrome.Options().addArguments(
			// On démarre Chrome en mode headless pour éviter d'avoir besoin d'une vraie interface graphique.
			'--headless=new',
			// On autorise Chrome à fonctionner dans le conteneur du projet.
			'--no-sandbox',
			// On réduit les problèmes de mémoire partagée dans l'environnement Linux.
			'--disable-dev-shm-usage',
			// On désactive l'accélération GPU, inutile ici.
			'--disable-gpu'
		);

		// Si un chemin vers Chrome est fourni dans l'environnement, on l'utilise.
		if (process.env.CHROME_BIN) {
			// On force l'utilisation du binaire Chrome/Chromium défini dans l'environnement.
			chromeOptions.setChromeBinaryPath(process.env.CHROME_BIN);
		}

		// On construit le navigateur Chrome piloté par Selenium.
		driver = await new Builder()
			// On indique que le navigateur à piloter est Chrome.
			.forBrowser('chrome')
			// On applique les options configurées ci-dessus.
			.setChromeOptions(chromeOptions)
			// On démarre effectivement le navigateur.
			.build();
	});

	// Après le test, on ferme le navigateur et on tue le serveur s'il a été démarré.
	after(async function () {
		// Si le navigateur existe, on le ferme proprement.
		if (driver) {
			// La méthode quit() termine la session Chrome.
			await driver.quit();
		}
		// Si le serveur a été démarré automatiquement par le test, on le stoppe.
		if (serverProcess) {
			serverProcess.kill('SIGTERM');
		}
	});

	// Ce test vérifie qu'un utilisateur peut sélectionner un produit et voir son détail.
	it('affiche le détail d\'un produit sélectionné', async function () {
		// On ouvre la page d'accueil de l'application pour commencer le parcours utilisateur.
		await driver.get(SHOPNOW_URL);

		// On attend que le lien de navigation vers la page Produits soit présent dans le DOM.
		const productsLink = await driver.wait(
			// On cherche le lien Produits via son data-testid défini dans le HTML.
			until.elementLocated(By.css('[data-testid="products-link"]')),
			// On attend 10 secondes au maximum pour trouver le lien.
			10000,
			// Message affiché si le lien vers les produits est introuvable.
			'Le lien vers la page Produits est introuvable'
		);

		// On clique sur le lien Produits pour accéder au catalogue.
		await productsLink.click();

		// On attend qu'un produit soit cliquable dans le catalogue.
		const selectProductButton = await driver.wait(
			// On cherche le premier bouton ayant un data-testid commençant par "view-product-".
			until.elementLocated(By.css('[data-testid^="view-product-"]')),
			// On attend 10 secondes maximum avant d'échouer.
			10000,
			// Message affiché si aucun produit n'est présent pour être sélectionné.
			'Aucun produit sélectionnable n’est présent dans le catalogue'
		);

		// On clique sur le premier produit disponible pour ouvrir sa page de détail.
		await selectProductButton.click();

		// On attend que la page de détail du produit soit visible.
		const productPage = await driver.wait(
			// On repère la page de détail grâce à son data-testid.
			until.elementLocated(By.css('[data-testid="product-page"]')),
			// On attend 10 secondes maximum pour que la page se charge.
			10000,
			// Message affiché si la page de détail n'est pas trouvée.
			'La page de détail du produit est introuvable'
		);

		// Vérification 1 : on confirme que la page de détail est bien affichée.
		assert.strictEqual(await productPage.isDisplayed(), true);

		// Vérification 2 : on vérifie que l'URL de la page contient le paramètre d'identifiant du produit.
		assert.match(await driver.getCurrentUrl(), /product\.html\?id=\d+/i);

		// On attend que le nom du produit soit présent dans la page.
		const productName = await driver.wait(
			// On cherche le nom du produit via data-testid="product-name".
			until.elementLocated(By.css('[data-testid="product-name"]')),
			// On attend 10 secondes maximum pour trouver le nom.
			10000,
			// Message affiché si le nom du produit est absent.
			'Le nom du produit est introuvable'
		);

		// Vérification 3 : on vérifie que le nom du produit est visible et qu'il contient du texte.
		assert.strictEqual(await productName.isDisplayed(), true);
		assert.ok((await productName.getText()).trim().length > 0, 'Le nom du produit est vide');

		// On attend que le prix du produit soit présent dans la page.
		const productPrice = await driver.wait(
			// On cherche le prix du produit via data-testid="product-price".
			until.elementLocated(By.css('[data-testid="product-price"]')),
			// On attend 10 secondes maximum pour trouver le prix.
			10000,
			// Message affiché si le prix est absent.
			'Le prix du produit est introuvable'
		);

		// Vérification 4 : on vérifie que le prix du produit est visible et qu'il contient une valeur.
		assert.strictEqual(await productPrice.isDisplayed(), true);
		assert.ok((await productPrice.getText()).trim().length > 0, 'Le prix du produit est vide');

		// On crée le dossier de captures s'il n'existe pas.
		const screenshotDir = path.resolve(__dirname, '../../screenshots');
		// On s'assure que le dossier existe avant d'écrire une capture d'écran.
		fs.mkdirSync(screenshotDir, { recursive: true });
		// On définit le nom du fichier image qui contiendra le rendu de la page de détail.
		const screenshotPath = path.join(screenshotDir, 'detail-produit.png');
		// On prend une capture du rendu actuel du navigateur.
		const image = await driver.takeScreenshot();
		// On écrit l'image dans le fichier PNG.
		fs.writeFileSync(screenshotPath, image, 'base64');
		// On affiche le chemin du fichier pour pouvoir le retrouver facilement.
		console.log(`Capture sauvegardée : ${screenshotPath}`);
	});
});
