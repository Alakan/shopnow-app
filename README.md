# ShopNow — Application de démonstration (TP INF243 · Stratégie de tests)

[![Java](https://img.shields.io/badge/Java-17-2f6b4f)]() [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-2f6b4f)]() [![Maven](https://img.shields.io/badge/Maven-3.9-2f6b4f)]()

**Scénario :** vous travaillez pour une entreprise fictive, **ShopNow**, plateforme de
commerce électronique. L'application permet à un utilisateur de :

- créer un compte ;
- se connecter ;
- consulter les produits ;
- rechercher un produit ;
- ajouter un produit au panier ;
- modifier la quantité ;
- supprimer un produit ;
- passer une commande ;
- effectuer un paiement (simulé) ;
- consulter ses commandes.

Elle expose une **UI web** (Thymeleaf) et une **API REST** (`/api/*`) qui servent de
cible aux ateliers du TP : Selenium (fonctionnel), Postman/Newman (intégration),
JMeter (performance), chaos contrôlé (fiabilité), SonarQube (statique), Jenkins
(orchestration du pipeline).

---

## 🚀 Démarrage rapide

```bash
# Option 1 — avec Docker (application exposée sur http://localhost:8081)
docker compose up -d app
# UI :  http://localhost:8081   ·   API : http://localhost:8081/api

# Option 2 — avec Maven (application sur http://localhost:8080)
mvn spring-boot:run
# UI :  http://localhost:8080   ·   API : http://localhost:8080/api
```

Tests (unitaires + intégration API) :

```bash
mvn clean verify        # surefire + MockMvc + rapport de couverture JaCoCo
mvn verify -P e2e -Dapp.url=http://localhost:8080   # tests Selenium (app démarrée)
```

---

## 🗺 Structure du projet

```
shopnow/                     ← racine du dépôt
├── src/main/java/com/shopnow/
│   ├── model/               Produit, Commande, LigneCommande, Utilisateur, StatutCommande
│   ├── repository/          Accès données (Spring Data JPA)
│   ├── service/             Règles métier : catalogue, commandes, comptes
│   └── web/                 Contrôleurs API REST (/api) + contrôleurs pages (Thymeleaf)
├── src/main/resources/      application.yml + jeu de données (data.sql) + templates/
├── src/test/java/           Tests unitaires + tests d'intégration API (MockMvc)
├── src/test/e2e/java/       Tests fonctionnels Selenium (profil « e2e »)
├── tests/api/               Collection + environnement Postman/Newman
├── tests/performance/       Plan de charge JMeter (plan-api.jmx)
├── scripts/chaos.sh         Expérience de fiabilité (arrêt/redémarrage du conteneur)
├── Dockerfile               Image de production (multi-stage)
├── docker-compose.yml       Stack : app + Jenkins + SonarQube (+ GitLab optionnel)
├── .gitlab-ci.yml           Pipeline CI minimal GitLab (atelier A5)
└── Jenkinsfile              Pipeline Jenkins déclaratif complet (Jour 2)
```

---

## 🔌 API REST

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/produits` | Liste des produits (`?q=` pour la recherche) |
| GET | `/api/produits/{id}` | Détail d'un produit |
| POST | `/api/produits` | Créer un produit `{nom, description, categorie, prix}` |
| POST | `/api/commandes` | Créer une commande `{panier: {produitId: quantité}, emailUtilisateur}` |
| GET | `/api/commandes/{id}` | Détail + statut d'une commande |
| POST | `/api/commandes/{id}/paiement` | Paiement simulé `{numeroCarte: "4111…"}` (16 chiffres) |
| POST | `/api/utilisateurs` | Créer un compte `{nom, email, motDePasse}` |
| POST | `/api/connexion` | Vérifier les identifiants → 200 ou 401 |

Exemple :

```bash
curl -s http://localhost:8080/api/produits | jq '.[0]'
curl -s -X POST http://localhost:8080/api/commandes \
  -H 'Content-Type: application/json' \
  -d '{"panier":{"382":2}}'
```

Jeu de données : **12 produits** seedés (`data.sql`), dont le produit **382**
« Casque gaming Bluetooth » (donnée de test stable des tests Selenium).

---

## 🧪 Cible des ateliers du TP

| Atelier | Cible | Fichier de départ |
|---|---|---|
| A1 · Selenium (fonctionnel) | Parcours UI, `data-testid` (cf. `data-testids.md`) | `src/test/e2e/.../ParcoursCommandeTest.java` |
| A2 · Postman/Newman (intégration) | API REST | `tests/api/ecommerce.postman_collection.json` |
| A3 · JMeter (performance) | `GET /api/produits` sous charge | `tests/performance/plan-api.jmx` |
| A4–B3 · Fiabilité (chaos) | Conteneur d'application | `scripts/chaos.sh` |
| B1 · SonarQube | Analyse statique + qualité gate | `mvn sonar:sonar -Dsonar.projectKey=ecommerce-demo …` |
| B0–B2 · Pipeline | Jenkins + GitLab | `docker-compose.yml` + `Jenkinsfile` + `.gitlab-ci.yml` |

---

## 🧑‍🏫 Mise en place par l'enseignant (flux GitHub)

1. Téléchargez le dossier, puis initialisez et poussez le dépôt :

   ```bash
   cd shopnow-app
   git init -b main
   git add .
   git commit -m "ShopNow : application de démonstration du TP INF243"
   git remote add origin https://github.com/VOTRE-COMPTE/shopnow-app.git
   git push -u origin main
   ```

2. Les étudiants **forkent** le dépôt (bouton *Fork* sur GitHub), le clonent, puis
   suivent le TP : prise en main des outils (Jour 1 après-midi), puis construction
   du pipeline complet (Jour 2) — cf. le document *« TP — Outillage de tests &
   pipeline d'intégration continue »* distribué en cours.

---

## 📚 Références

- Selenium : https://www.selenium.dev/documentation/
- Newman : https://learning.postman.com/docs/collections/running-collections/newman-intro/
- JMeter : https://jmeter.apache.org/usermanual/
- Jenkins Pipeline : https://www.jenkins.io/doc/
- SonarQube : https://docs.sonarsource.com/sonarqube/
- GitLab CI/CD : https://docs.gitlab.com/ee/ci/

---

⚠️ **Note pédagogique :** ceci est une application de cours. Le hachage de mots de
passe (SHA-256 + sel) et l'absence de sécurité applicative réelle sont volontaires
pour rester lisibles ; dans une application de production, utilisez des mécanismes
dédiés (bcrypt/Argon2, Spring Security, etc.).
