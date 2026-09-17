// Importe le module HTTP pour vérifier que l'application répond.
const http = require('http');
// Importe spawn pour démarrer le serveur si nécessaire.
const { spawn } = require('child_process');
// Importe path pour calculer le dossier racine de l'application.
const path = require('path');
// Importe Builder pour créer le navigateur Selenium.
const { Builder } = require('selenium-webdriver');
// Importe les options Chrome.
const chrome = require('selenium-webdriver/chrome');

// Définit l'URL utilisée par les tests.
const SHOPNOW_URL = process.env.SHOPNOW_URL || 'http://localhost:3000';
// Définit le dossier depuis lequel le serveur doit être démarré.
const APP_ROOT = path.resolve(__dirname, '../..');

// Attend qu'une URL HTTP soit disponible.
function waitForServer(url, timeoutMs = 20000) {
	// Retourne une promesse représentant l'attente du serveur.
	return new Promise((resolve, reject) => {
		// Mémorise le début de l'attente.
		const startedAt = Date.now();
		// Définit une tentative de connexion réutilisable.
		const tryConnect = () => {
			// Envoie une requête GET vers l'application.
			const request = http.get(url, (response) => {
				// Consomme la réponse HTTP.
				response.resume();
				// Signale que le serveur est prêt.
				resolve();
			});
			// Réessaie si la connexion échoue.
			request.on('error', () => {
				// Arrête l'attente si le délai maximum est atteint.
				if (Date.now() - startedAt > timeoutMs) {
					reject(new Error(`Le serveur n'a pas répondu sur ${url}.`));
					return;
				}
				// Attend brièvement avant une nouvelle tentative.
				setTimeout(tryConnect, 250);
			});
			// Évite qu'une requête bloquée ne suspende le test.
			request.setTimeout(1000, () => {
				// Ferme la requête trop lente.
				request.destroy();
				// Vérifie le délai global après la fermeture.
				if (Date.now() - startedAt > timeoutMs) {
					reject(new Error(`Le serveur n'a pas répondu sur ${url}.`));
					return;
				}
				// Retente la connexion.
				setTimeout(tryConnect, 250);
			});
		};
		// Lance la première tentative.
		tryConnect();
	});
}

// Démarre le serveur seulement si aucune instance ne répond déjà.
async function startServerIfNeeded() {
	// Prépare la valeur de retour contenant le processus éventuellement créé.
	let serverProcess;
	// Vérifie si un serveur est déjà disponible.
	try {
		// Attend brièvement une réponse de l'application existante.
		await waitForServer(SHOPNOW_URL, 2000);
	} catch {
		// Démarre le serveur Express de l'application.
		serverProcess = spawn('node', ['server.js'], { cwd: APP_ROOT, stdio: 'ignore' });
		// Attend que le nouveau serveur soit prêt.
		await waitForServer(SHOPNOW_URL);
	}
	// Retourne le processus pour permettre son arrêt après le test.
	return serverProcess;
}

// Crée un navigateur Chrome adapté au conteneur Linux.
async function createDriver() {
	// Configure Chrome en mode headless pour fonctionner sans bureau graphique.
	const options = new chrome.Options().addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu');
	// Utilise le binaire fourni par l'environnement s'il existe.
	if (process.env.CHROME_BIN) options.setChromeBinaryPath(process.env.CHROME_BIN);
	// Construit et retourne la session Selenium.
	return new Builder().forBrowser('chrome').setChromeOptions(options).build();
}

// Exporte les fonctions utilisées par les nouveaux scénarios.
module.exports = { SHOPNOW_URL, createDriver, startServerIfNeeded };
