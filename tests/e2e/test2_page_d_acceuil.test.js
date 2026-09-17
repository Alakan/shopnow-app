// Importe les outils Selenium utilisés pour piloter le navigateur et rechercher des éléments.
const { Builder, By, until } = require('selenium-webdriver');
// Importe les options spécifiques à Chrome ou Chromium.
const chrome = require('selenium-webdriver/chrome');
// Importe le module d'assertions fourni par Node.js.
const assert = require('assert');
const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

// Utilise l'URL passée dans l'environnement ou l'URL locale par défaut.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';
const APP_ROOT = path.resolve(__dirname, '../..');

function waitForServer(url, timeoutMs = 20000) {
	return new Promise((resolve, reject) => {
		const startedAt = Date.now();

		const tryConnect = () => {
			const req = http.get(url, (res) => {
				res.resume();
				resolve();
			});

			req.on('error', () => {
				if (Date.now() - startedAt > timeoutMs) {
					reject(new Error(`Le serveur n’a pas répondu sur ${url} dans le délai imparti.`));
					return;
				}
				setTimeout(tryConnect, 250);
			});

			req.setTimeout(1000, () => {
				req.destroy();
				if (Date.now() - startedAt > timeoutMs) {
					reject(new Error(`Le serveur n’a pas répondu sur ${url} dans le délai imparti.`));
					return;
				}
				setTimeout(tryConnect, 250);
			});
		};

		tryConnect();
	});
}
const PAUSE_FOR_VISUAL = process.env.PAUSE_FOR_VISUAL === 'true';

// Regroupe les vérifications concernant la page d'accueil de ShopNow.
describe("Test 1 - Page d'accueil", function () {
	// Définit une durée maximale de trente secondes pour le groupe de tests.
	this.timeout(30000);

	// Déclare la variable qui contiendra le navigateur Selenium.
	let driver;
	let serverProcess;

	// Prépare le navigateur avant l'exécution du test.
	before(async function () {
		try {
			await waitForServer(SHOPNOW_URL, 2000);
		} catch {
			serverProcess = spawn('node', ['server.js'], {
				cwd: APP_ROOT,
				stdio: 'ignore'
			});
			await waitForServer(SHOPNOW_URL, 20000);
		}
		const chromeOptions = new chrome.Options();
		const shouldShowBrowser = process.env.SHOW_BROWSER === 'true' || !!process.env.DISPLAY;

		// En conteneur ou en CI, on reste en headless par défaut pour que le test démarre.
		// En local avec une interface graphique, on peut forcer l’affichage avec SHOW_BROWSER=true.
		if (!shouldShowBrowser) {
			chromeOptions.addArguments('--headless=new');
		}

		chromeOptions.addArguments(
			'--no-sandbox',
			'--disable-dev-shm-usage',
			'--disable-gpu',
			'--window-size=1440,1200'
		);

		if (shouldShowBrowser) {
			chromeOptions.addArguments('--start-maximized');
		}

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
		if (serverProcess) {
			serverProcess.kill('SIGTERM');
		}
	});

	// Vérifie que ShopNow est accessible et que sa page d'accueil est correctement affichée.
	it("affiche correctement la page d'accueil de ShopNow", async function () {
		// Demande au navigateur d'ouvrir l'URL de ShopNow.
		await driver.get(SHOPNOW_URL);

		// Attend que l'élément identifiant la page d'accueil soit présent dans le document.
		const homePage = await driver.wait(
			// Recherche l'élément portant l'identifiant de test de la page d'accueil.
			until.elementLocated(By.css('[data-testid="home-page"]')),
			// Attend au maximum dix secondes l'apparition de cet élément.
			10000,
			// Affiche ce message si la page d'accueil n'est pas trouvée.
			"La page d'accueil est introuvable"
		);

		// Vérifie que l'élément de la page d'accueil est visible.
		assert.strictEqual(await homePage.isDisplayed(), true);
		// Vérifie que l'URL courante correspond bien à l'URL demandée.
		assert.match(await driver.getCurrentUrl(), new RegExp(SHOPNOW_URL.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')));

		// Attend que le titre principal soit présent dans la page.
		const mainHeading = await driver.wait(
			// Recherche le titre principal HTML de la page.
			until.elementLocated(By.css('h1')),
			// Attend au maximum dix secondes l'apparition du titre.
			10000,
			// Affiche ce message si le titre principal n'est pas trouvé.
			'Le titre principal est introuvable'
		);

		// Vérifie que le titre principal est visible.
		assert.strictEqual(await mainHeading.isDisplayed(), true);
		// Vérifie que le titre contient le nom et le message attendus.
		assert.match(await mainHeading.getText(), /Bienvenue sur ShopNow/i);

		if (PAUSE_FOR_VISUAL) {
			await driver.sleep(2500);
		}

		const screenshotDir = path.resolve(__dirname, '../../screenshots');
		fs.mkdirSync(screenshotDir, { recursive: true });
		const screenshotPath = path.join(screenshotDir, 'home-page.png');
		const image = await driver.takeScreenshot();
		fs.writeFileSync(screenshotPath, image, 'base64');
		console.log(`Capture sauvegardée : ${screenshotPath}`);
	});
});
