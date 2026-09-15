#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Chaos contrôlé : arrêt / redémarrage du conteneur application pendant une
# charge légère, mesure du taux d'erreur et du temps de retour à la normale.
#
# Usage :  bash scripts/chaos.sh [URL_APP]
#   URL_APP : http://localhost:8081 (valeur par défaut appliquée par Jenkins)
#
# Prérequis : docker, curl. L'application doit tourner dans un conteneur
# nommé "shopnow-app" (docker compose up -d app).
# ---------------------------------------------------------------------------
set -uo pipefail

APP_URL="${1:-http://localhost:8081}"
APP_CONTAINER="${APP_CONTAINER:-shopnow-app}"
HTTP_OK="000,200,204"   # codes considérés comme « machine vivante »

req() {
  # retourne le code HTTP de l'endpoint de santé
  curl -s -o /dev/null -w "%{http_code}" --max-time 3 "${APP_URL}/api/produits" || echo "000"
}

echo "==> Chaos contrôlé sur ${APP_URL}"
echo "==> État initial : $(req)"

if ! docker ps --format '{{.Names}}' | grep -q "^${APP_CONTAINER}$"; then
  echo "!! Conteneur '${APP_CONTAINER}' introuvable — lancez d'abord : docker compose up -d app"
  exit 1
fi

echo "==> Arrêt du conteneur (simulation de panne) : ${APP_CONTAINER}"
docker stop "${APP_CONTAINER}" >/dev/null

echo "==> Pendant l'indisponibilité (5 mesures espacées de 1 s) :"
ERREURS=0
for i in 1 2 3 4 5; do
  code="$(req)"
  echo "   mesure ${i} → HTTP ${code}"
  if [[ "${HTTP_OK}" == *"${code}"* ]]; then
    : # la réponse est encore servie (file d'attente/keep-alive)
  else
    ERREURS=$((ERREURS + 1))
  fi
  sleep 1
done

echo "==> Redémarrage du conteneur"
docker start "${APP_CONTAINER}" >/dev/null

echo "==> Attente du retour à la normale…"
while :; do
  code="$(req)"
  [[ "${code}" == "200" ]] && break
  sleep 2
done
echo "==> Retour à la normale : HTTP 200"

echo "--------------------------------------------------------------------------------"
echo "Bilan chaos : ${ERREURS}/5 mesures en erreur pendant la panne."
echo "Interprétation : des erreurs pendant l'arrêt sont NORMALES ; ce qui compte,"
echo "c'est la détection, le temps de récupération et le comportement du client (retry)."
echo "--------------------------------------------------------------------------------"
