# Guide de déploiement AgriConnect

## 🚀 Déploiement Frontend (Vercel)

### 1. Préparer le projet
```bash
# Dans le dossier frontend
npm run build
```

### 2. Variables d'environnement
Créer un fichier `.env.production` dans `frontend/`:
```env
VITE_API_URL=https://votre-backend.railway.app/api
```

### 3. Déployer sur Vercel
1. Aller sur [vercel.com](https://vercel.com)
2. Connecter votre compte GitHub
3. Importer le projet
4. Configurer :
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

## 🖥️ Déploiement Backend (Render)

### 1. Préparer le projet
Le fichier `render.yaml` est déjà configuré à la racine du projet.

### 2. Déployer sur Render

#### Option A : Via render.yaml (Recommandé)
1. Aller sur [render.com](https://render.com)
2. Créer un compte ou se connecter
3. Cliquer sur "New +" → "Blueprint"
4. Connecter votre dépôt GitHub
5. Sélectionner le dépôt `agriconnect`
6. Render détectera automatiquement le fichier `render.yaml`
7. Cliquer sur "Apply"

#### Option B : Via l'interface web
1. Aller sur [render.com](https://render.com)
2. Cliquer sur "New +" → "Web Service"
3. Connecter votre dépôt GitHub
4. Sélectionner le dépôt `agriconnect`
5. Configurer :
   - **Name**: `agriconnect-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: `Free`

### 3. Variables d'environnement sur Render
Dans les paramètres du service, ajouter les variables d'environnement suivantes :

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://dili:Al55450@cluster0.jbqemdq.mongodb.net/agriconnect?retryWrites=true&w=majority
JWT_SECRET=votre_jwt_secret_securise_tres_long_et_aleatoire
FRONTEND_URL=https://votre-app.vercel.app
```

**Important** :
- `PORT` doit être `10000` (port par défaut de Render)
- `FRONTEND_URL` doit être l'URL de votre frontend Vercel
- `MONGODB_URI` : votre URI MongoDB Atlas
- `JWT_SECRET` : une clé secrète longue et aléatoire

### 4. Configuration MongoDB Atlas
1. Aller sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Dans "Network Access", ajouter `0.0.0.0/0` pour autoriser toutes les IPs
3. Vérifier que votre utilisateur de base de données a les bonnes permissions

### 5. Mettre à jour le Frontend Vercel
Après avoir déployé le backend, mettre à jour la variable d'environnement dans Vercel :
1. Aller dans les paramètres de votre projet Vercel
2. Section "Environment Variables"
3. Ajouter/modifier :
   ```
   VITE_API_URL=https://agriconnect-backend.onrender.com/api
   ```
4. Redéployer le frontend

### 6. Vérifier le déploiement
- Health check : `https://agriconnect-backend.onrender.com/api/health`
- Test API : `https://agriconnect-backend.onrender.com/api/test`

---

## 🖥️ Déploiement Backend (Railway) - Alternative

### 1. Préparer le projet
Créer un fichier `railway.json` à la racine:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "healthcheckPath": "/api/health"
  }
}
```

### 2. Variables d'environnement sur Railway
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=votre_mongodb_atlas_uri
JWT_SECRET=votre_jwt_secret_securise
```

### 3. Déployer sur Railway
1. Aller sur [railway.app](https://railway.app)
2. Connecter GitHub
3. Créer un nouveau projet
4. Ajouter les variables d'environnement
5. Déployer

## 🗄️ Base de données (MongoDB Atlas)

### Configuration de production
1. Créer un cluster de production
2. Configurer les IPs autorisées (0.0.0.0/0 pour Railway)
3. Créer un utilisateur de base de données
4. Récupérer l'URI de connexion

## 📁 Stockage d'images (Cloudinary)

### 1. Créer un compte Cloudinary
1. Aller sur [cloudinary.com](https://cloudinary.com)
2. Créer un compte gratuit
3. Récupérer les credentials

### 2. Modifier le backend
Remplacer le stockage local par Cloudinary:
```bash
npm install cloudinary multer-storage-cloudinary
```

## 🔧 Modifications nécessaires

### Backend
1. Ajouter une route de santé
2. Configurer CORS pour le domaine de production
3. Gérer les variables d'environnement
4. Optimiser pour la production

### Frontend
1. Configurer les URLs d'API pour la production
2. Optimiser les images
3. Configurer le routing pour SPA

## 📊 Monitoring gratuit

### Vercel Analytics
- Analytics de performance
- Métriques d'utilisation
- Gratuit jusqu'à 100k événements/mois

### Railway Metrics
- Logs en temps réel
- Métriques de performance
- Monitoring de base gratuit

## 💰 Coûts estimés

- **Frontend (Vercel)** : 0€
- **Backend (Render)** : 0€ (750h/mois)
- **Base de données (MongoDB Atlas)** : 0€ (512MB)
- **Stockage (Cloudinary)** : 0€ (25GB)
- **Total** : 0€/mois

## 🚨 Limitations gratuites

### Render
- 750h d'exécution/mois (gratuit)
- Application "sleep" après 15 minutes d'inactivité
- Redémarrage lent (cold start ~30-60 secondes)
- Pas de limite de bande passante
- Logs disponibles pendant 7 jours

### Railway
- 500h d'exécution/mois
- Application "sleep" après inactivité
- Redémarrage lent (cold start)

### MongoDB Atlas
- 512MB de stockage
- Cluster partagé (performance limitée)

### Cloudinary
- 25GB de stockage
- 25GB de bande passante/mois

## 🔄 Alternatives si limites atteintes

### Backend
- **Render** : 750h gratuites
- **Fly.io** : 3 apps gratuites
- **DigitalOcean App Platform** : 100h gratuites

### Base de données
- **Railway PostgreSQL** : 1GB gratuit
- **Supabase** : 500MB gratuit
- **PlanetScale** : 1GB gratuit







