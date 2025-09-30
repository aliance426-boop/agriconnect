# 🌾 AgriConnect - Plateforme de Connexion Agricole

AgriConnect est une plateforme innovante qui connecte directement les producteurs et commerçants agricoles au Burkina Faso, avec l'aide de l'intelligence artificielle pour des conseils personnalisés.

## ✨ Fonctionnalités Principales

### 🎯 Pour les Producteurs
- **Dashboard complet** : Gestion des produits, commandes, profil
- **Upload d'images** : Photos des produits avec stockage sécurisé
- **Chatbot IA** : Conseiller agricole spécialisé Burkina Faso
- **Gestion des commandes** : Accepter/refuser les commandes
- **Profil personnalisé** : Informations détaillées

### 🎯 Pour les Commerçants
- **Catalogue producteurs** : Liste complète avec informations de contact
- **Système de commandes** : Interface intuitive pour passer des commandes
- **Intégration WhatsApp** : Contact direct avec les producteurs
- **Suivi des commandes** : Historique complet des achats
- **Recherche par catégorie** : Filtrage des produits

### 🤖 Chatbot IA Agricole
- **Conseils spécialisés** : Météo, saisons, maladies, prix, techniques
- **Historique des conversations** : Sauvegarde des échanges
- **Interface moderne** : Chat en temps réel
- **API Gemini/OpenAI** : Intelligence artificielle avancée

## 🚀 Technologies Utilisées

### Frontend
- **React 18** - Interface utilisateur moderne
- **Vite** - Build tool rapide
- **Tailwind CSS** - Framework CSS utilitaire
- **React Router** - Navigation
- **Axios** - Requêtes HTTP
- **React Hot Toast** - Notifications
- **Lucide React** - Icônes

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification
- **Multer** - Upload de fichiers
- **Bcryptjs** - Hachage des mots de passe
- **Express Validator** - Validation des données

### IA
- **Google Gemini API** - Chatbot agricole
- **OpenAI API** - Alternative IA

## 📦 Installation

### Prérequis
- Node.js (v16 ou supérieur)
- MongoDB (local ou Atlas)
- Compte Google Gemini ou OpenAI

### 1. Cloner le projet
```bash
git clone <repository-url>
cd agriconnect
```

### 2. Installer les dépendances
```bash
# Installer toutes les dépendances
npm run install-all

# Ou manuellement
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configuration
```bash
# Backend - Créer le fichier .env
cd backend
cp .env.example .env
```

Modifier le fichier `.env` :
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agriconnect
JWT_SECRET=votre_secret_jwt_tres_securise
GEMINI_API_KEY=votre_cle_api_gemini
OPENAI_API_KEY=votre_cle_api_openai
NODE_ENV=development
```

### 4. Créer le dossier uploads
```bash
mkdir backend/uploads
```

### 5. Démarrer l'application
```bash
# Démarrer backend et frontend simultanément
npm run dev

# Ou séparément
npm run server  # Backend sur port 5000
npm run client  # Frontend sur port 3000
```

## 🌐 Accès à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000/api
- **Test API** : http://localhost:5000/api/test

## 👥 Comptes de démonstration

### Producteur
- **Email** : producteur@demo.com
- **Mot de passe** : demo123

### Commerçant
- **Email** : commercant@demo.com
- **Mot de passe** : demo123

## 📱 Utilisation

### 1. Inscription
- Choisir le rôle (Producteur/Commerçant)
- Remplir les informations personnelles
- Validation automatique

### 2. Producteur
- Ajouter des produits avec photos
- Gérer les commandes reçues
- Utiliser le chatbot IA pour des conseils
- Modifier le profil

### 3. Commerçant
- Parcourir les producteurs disponibles
- Voir les produits de chaque producteur
- Passer des commandes
- Contacter via WhatsApp

### 4. Chatbot IA
- Créer des conversations
- Poser des questions agricoles
- Recevoir des conseils personnalisés
- Consulter l'historique

## 🗄️ Structure de la Base de Données

### Collections MongoDB

#### Users
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  location: String,
  role: "PRODUCER" | "MERCHANT",
  companyName: String (si merchant),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Products
```javascript
{
  title: String,
  price: Number,
  quantity: Number,
  category: String,
  description: String,
  image: String,
  producerId: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Orders
```javascript
{
  merchantId: ObjectId,
  producerId: ObjectId,
  productId: ObjectId,
  quantity: Number,
  totalPrice: Number,
  status: "PENDING" | "ACCEPTED" | "REFUSED" | "DELIVERED",
  message: String,
  deliveryDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Conversations
```javascript
{
  userId: ObjectId,
  title: String,
  messages: [{
    role: "user" | "ai",
    content: String,
    timestamp: Date
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/my-products` - Mes produits (producteur)
- `POST /api/products` - Créer un produit
- `PUT /api/products/:id` - Modifier un produit
- `DELETE /api/products/:id` - Supprimer un produit

### Commandes
- `GET /api/orders/my-orders` - Mes commandes
- `POST /api/orders` - Créer une commande
- `PUT /api/orders/:id/status` - Modifier le statut

### Utilisateurs
- `GET /api/users/producers` - Liste des producteurs
- `GET /api/users/merchants` - Liste des commerçants
- `PUT /api/users/profile` - Modifier le profil

### Chatbot
- `GET /api/chatbot/conversations` - Mes conversations
- `POST /api/chatbot/conversations` - Créer une conversation
- `POST /api/chatbot/conversations/:id/messages` - Envoyer un message
- `DELETE /api/chatbot/conversations/:id` - Supprimer une conversation

## 🎨 Design et UX

### Thème Agricole
- **Couleurs** : Vert (primary), Jaune (secondary)
- **Typographie** : Inter (moderne et lisible)
- **Icônes** : Lucide React (cohérentes)
- **Responsive** : Mobile-first design

### Composants
- **Cards** : Design épuré avec ombres subtiles
- **Boutons** : États hover et disabled
- **Formulaires** : Validation en temps réel
- **Modales** : Overlay avec animations
- **Notifications** : Toast messages

## 🚀 Déploiement

### Backend (Heroku/Railway)
```bash
# Variables d'environnement
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
GEMINI_API_KEY=...
NODE_ENV=production
```

### Frontend (Vercel/Netlify)
```bash
# Build
npm run build

# Variables d'environnement
VITE_API_URL=https://votre-api.herokuapp.com/api
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support :
- **Email** : support@agriconnect.bf
- **WhatsApp** : +226 XX XX XX XX
- **Site web** : https://agriconnect.bf

---

**AgriConnect** - Connecter l'agriculture au Burkina Faso avec l'IA 🚀


