# Script de déploiement AgriConnect
Write-Host "🚀 Déploiement d'AgriConnect" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis la racine du projet" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Préparation du déploiement..." -ForegroundColor Yellow

# Build du frontend
Write-Host "🔨 Build du frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build du frontend" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host "✅ Build terminé avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Pousser le code sur GitHub" -ForegroundColor White
Write-Host "2. Connecter le repo à Vercel (frontend)" -ForegroundColor White
Write-Host "3. Connecter le repo à Railway (backend)" -ForegroundColor White
Write-Host "4. Configurer les variables d'environnement" -ForegroundColor White
Write-Host ""
Write-Host "📖 Consultez deployment-guide.md pour les instructions détaillées" -ForegroundColor Cyan
