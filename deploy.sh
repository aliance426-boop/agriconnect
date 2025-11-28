#!/bin/bash

echo "🚀 Déploiement d'AgriConnect"
echo "=============================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

echo "📦 Préparation du déploiement..."

# Build du frontend
echo "🔨 Build du frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build du frontend"
    exit 1
fi
cd ..

echo "✅ Build terminé avec succès!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Pousser le code sur GitHub"
echo "2. Connecter le repo à Vercel (frontend)"
echo "3. Connecter le repo à Railway (backend)"
echo "4. Configurer les variables d'environnement"
echo ""
echo "📖 Consultez deployment-guide.md pour les instructions détaillées"







