# 🚀 Guide de déploiement Render - AgriConnect Backend

## Étapes rapides

### 1. Préparer votre dépôt GitHub
Assurez-vous que votre code est poussé sur GitHub avec le fichier `render.yaml`.

### 2. Créer un compte Render
1. Aller sur [render.com](https://render.com)
2. Créer un compte (gratuit)
3. Connecter votre compte GitHub

### 3. Déployer via Blueprint (Recommandé)
1. Cliquer sur **"New +"** → **"Blueprint"**
2. Sélectionner votre dépôt GitHub `agriconnect`
3. Render détectera automatiquement le fichier `render.yaml`
4. Cliquer sur **"Apply"**
5. Render créera automatiquement le service avec la configuration

### 4. Configurer les variables d'environnement
Dans les paramètres du service créé, aller dans **"Environment"** et ajouter :

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://dili:Al55450@cluster0.jbqemdq.mongodb.net/agriconnect?retryWrites=true&w=majority
JWT_SECRET=votre_jwt_secret_tres_long_et_aleatoire_ici
FRONTEND_URL=https://votre-app-frontend.vercel.app
```

**Important** :
- Remplacez `FRONTEND_URL` par l'URL réelle de votre frontend Vercel
- Remplacez `JWT_SECRET` par une clé secrète longue et aléatoire
- Le `PORT` doit rester `10000` (port par défaut Render)

### 5. Configurer MongoDB Atlas
1. Aller sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Dans **"Network Access"**, ajouter `0.0.0.0/0` pour autoriser toutes les IPs
3. Vérifier que votre utilisateur a les permissions nécessaires

### 6. Mettre à jour le Frontend Vercel
1. Aller dans les paramètres de votre projet Vercel
2. Section **"Environment Variables"**
3. Ajouter/modifier :
   ```
   VITE_API_URL=https://agriconnect-backend.onrender.com/api
   ```
   (Remplacez par l'URL réelle de votre backend Render)
4. Redéployer le frontend

### 7. Vérifier le déploiement
- **Health check** : `https://votre-backend.onrender.com/api/health`
- **Test API** : `https://votre-backend.onrender.com/api/test`

## Alternative : Déploiement manuel

Si vous préférez ne pas utiliser le Blueprint :

1. Cliquer sur **"New +"** → **"Web Service"**
2. Connecter votre dépôt GitHub
3. Sélectionner le dépôt `agriconnect`
4. Configurer :
   - **Name** : `agriconnect-backend`
   - **Environment** : `Node`
   - **Root Directory** : (laisser vide)
   - **Build Command** : `cd backend && npm install`
   - **Start Command** : `cd backend && npm start`
   - **Plan** : `Free`
5. Ajouter les variables d'environnement (voir étape 4)
6. Cliquer sur **"Create Web Service"**

## ⚠️ Notes importantes

- **Cold Start** : La première requête après inactivité peut prendre 30-60 secondes
- **Sleep Mode** : L'application se met en veille après 15 minutes d'inactivité
- **Logs** : Disponibles dans l'onglet "Logs" du service (gratuit pendant 7 jours)
- **HTTPS** : Automatiquement activé par Render

## 🔧 Dépannage

### L'application ne démarre pas
- Vérifier les logs dans l'onglet "Logs"
- Vérifier que toutes les variables d'environnement sont correctement configurées
- Vérifier que `PORT=10000` est défini

### Erreurs CORS
- Vérifier que `FRONTEND_URL` correspond exactement à l'URL de votre frontend Vercel
- Vérifier que l'URL ne se termine pas par un `/`

### Erreurs de connexion MongoDB
- Vérifier que l'IP `0.0.0.0/0` est autorisée dans MongoDB Atlas
- Vérifier que les identifiants MongoDB sont corrects
- Vérifier que le cluster MongoDB est actif

## 📞 Support

Pour plus d'aide, consultez :
- [Documentation Render](https://render.com/docs)
- [Guide de déploiement complet](./deployment-guide.md)

