# Configuration Cloudinary pour les Images

## Problème
Sur les hébergeurs gratuits comme Render, le système de fichiers est **éphémère**. Tous les fichiers uploadés dans le dossier `uploads/` sont supprimés à chaque redéploiement ou redémarrage du serveur.

## Solution : Cloudinary
Cloudinary est un service de gestion d'images dans le cloud avec un **plan gratuit généreux** :
- ✅ 25 GB de stockage
- ✅ 25 GB de bande passante par mois
- ✅ Transformations d'images automatiques
- ✅ CDN global pour des chargements rapides

## Étapes de Configuration

### 1. Créer un compte Cloudinary
1. Allez sur [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Créez un compte gratuit
3. Une fois connecté, allez dans le **Dashboard**

### 2. Récupérer les identifiants
Dans le Dashboard, vous trouverez :
- **Cloud Name** : Votre nom de cloud (ex: `dxyz123`)
- **API Key** : Votre clé API (ex: `123456789012345`)
- **API Secret** : Votre secret API (ex: `abcdefghijklmnopqrstuvwxyz`)

### 3. Ajouter les variables d'environnement sur Render

Dans votre service backend sur Render, ajoutez ces variables dans **Environment** :

```
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
USE_CLOUDINARY=true
```

### 4. Redéployer
Après avoir ajouté les variables, redéployez votre service.

## Fonctionnement

- **En production** (Render) : Les images sont automatiquement uploadées sur Cloudinary
- **En développement local** : Les images sont stockées localement dans `uploads/` (si Cloudinary n'est pas configuré)

## Migration des images existantes

Les images déjà uploadées en local ne seront pas migrées automatiquement. Vous devrez :
1. Re-uploader les photos de profil
2. Re-uploader les images de produits

Ou créer un script de migration (optionnel).

## Support

Si vous avez des questions, consultez la [documentation Cloudinary](https://cloudinary.com/documentation).

