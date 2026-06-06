#!/usr/bin/env bash
set -euo pipefail

PROJECT="${PROJECT:-depfund-498022-d7}"
BUCKET="${BUCKET:-prod-depfund-frontend}"
REGION="${REGION:-us-central1}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "═══════════════════════════════════════════"
echo "  DepFund — Deploy Frontend a GCS"
echo "  Bucket: gs://${BUCKET}"
echo "═══════════════════════════════════════════"

echo "▸ Instalando dependencias"
cd "$ROOT_DIR"
npm ci

echo "▸ Build (VITE_API_URL=${VITE_API_URL:-http://localhost:8000/api})"
VITE_API_URL="${VITE_API_URL:-http://localhost:8000/api}" npm run build

echo "▸ Subiendo a GCS"
gsutil -m rsync -r -d "$ROOT_DIR/dist/" "gs://${BUCKET}/"

echo "▸ Configurrando cache"
gsutil -m setmeta -h "Cache-Control:no-cache,no-store,must-revalidate" "gs://${BUCKET}/**/*.html"
gsutil -m setmeta -h "Cache-Control:public,max-age=31536000" "gs://${BUCKET}/**/*.{js,css,png,jpg,svg,ico,woff2}"

echo "═══════════════════════════════════════════"
echo "  Deploy completado ✅"
echo "  URL: https://storage.googleapis.com/${BUCKET}/index.html"
echo "═══════════════════════════════════════════"
