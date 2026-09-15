/* Jenkinsfile — pipeline déclaratif complet (TP « Jour 2 »).
 * Aux étudiants : adaptez les chemins, tokens et profils de votre environnement.
 * L'application doit être accessible sur ${APP_URL} pendant le pipeline
 * (docker compose up -d app → http://localhost:8081).
 */

pipeline {
  agent any

  environment {
    APP_URL   = "http://localhost:8081"
    SONAR_URL = "http://localhost:9000"
    SONAR_KEY = "ecommerce-demo"
  }

  stages {
    stage("1 · Build & tests unitaires") {
      steps {
        sh "mvn clean verify"
        sh "curl -sf ${APP_URL}/actuator/health"
      }
      post { success {
        junit "**/target/surefire-reports/*.xml"
        publishHTML([reportDir: "target/site/jacoco", reportFiles: "index.html",
                     reportName: "Couverture (JaCoCo)"])
      } }
    }

    stage("2 · Analyse statique SonarQube") {
      steps {
        withCredentials([string(credentialsId: "sonar-token", variable: "SONAR_TOKEN")]) {
          sh """mvn sonar:sonar \
            -Dsonar.projectKey=${SONAR_KEY} \
            -Dsonar.host.url=${SONAR_URL} \
            -Dsonar.token=${SONAR_TOKEN}"""
        }
      }
    }

    stage("2b · Qualité gate") {
      steps {
        timeout(5) {
          withCredentials([string(credentialsId: "sonar-token", variable: "SONAR_TOKEN")]) {
            sh """curl -sf -u ${SONAR_TOKEN}: \
              "${SONAR_URL}/api/qualitygates/project_status?projectKey=${SONAR_KEY}"
              | grep -q '"status":"OK'" """
          }
        }
      }
    }

    stage("3 · Intégration API — Newman") {
      steps { sh "npx newman run tests/api/ecommerce.postman_collection.json \
               -e tests/api/local.postman_environment.json \
               --reporters cli,junit --reporter-junit-export target/newman/report.xml" }
      post { success { junit "target/newman/*.xml" } }
    }

    stage("4 · Fonctionnel E2E — Selenium") {
      // Nécessite un navigateur Chromium sur l'agent Jenkins (ou un agent docker
      // dédié). À défaut d'agent piloté, laisser ce stage et l'exécuter en local :
      //   mvn verify -P e2e -Dapp.url=${APP_URL}
      steps { sh "mvn verify -P e2e -Dapp.url=${APP_URL}" }
      post { success {
        junit "**/target/failsafe-reports/*.xml"
        publishHTML([reportDir: "target/selenium", reportFiles: "index.html",
                     reportName: "Rapport Selenium"])
      } }
    }

    stage("5 · Performance — JMeter") {
      steps { sh """jmeter -n -t tests/performance/plan-api.jmx \
               -Japp.url=${APP_URL} \
               -l target/jmeter/results.jtl -e -o target/jmeter/html-report""" }
      post { success {
        publishHTML([reportDir: "target/jmeter/html-report", reportFiles: "index.html",
                     reportName: "Rapport JMeter"])
      } }
    }

    stage("6 · Fiabilité — chaos contrôlé") {
      steps { sh "bash scripts/chaos.sh ${APP_URL}" }
    }
  }

  post { always {
    archiveArtifacts artifacts: "target/**/report*.xml,target/jmeter/results.jtl", allowEmptyArchive: true
  } }
}
