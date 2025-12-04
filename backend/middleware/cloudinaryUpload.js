const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { optimizeImage } = require('./imageOptimizer');
const path = require('path');
const fs = require('fs').promises;

// Configuration du stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Déterminer le dossier selon le type de fichier
    let folder = 'agriconnect';
    if (file.fieldname === 'profileImage') {
      folder = 'agriconnect/profiles';
    } else if (file.fieldname === 'image') {
      folder = 'agriconnect/products';
    }

    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 1920, height: 1920, crop: 'limit', quality: 'auto' }
      ],
      resource_type: 'image'
    };
  }
});

// Filtre pour les types de fichiers
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: fileFilter
});

// Middleware pour optimiser et uploader vers Cloudinary
const optimizeAndUpload = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Si on utilise Cloudinary, le fichier est déjà uploadé
    // On récupère l'URL depuis req.file.path (qui contient l'URL Cloudinary)
    if (req.file.path && req.file.path.startsWith('http')) {
      // Le fichier est déjà sur Cloudinary, on stocke l'URL
      req.file.cloudinaryUrl = req.file.path;
      req.file.filename = req.file.filename || path.basename(req.file.path);
    }
  } catch (error) {
    console.error('Erreur lors de l\'upload Cloudinary:', error);
    return res.status(500).json({ message: 'Erreur lors de l\'upload de l\'image' });
  }

  next();
};

module.exports = { upload, optimizeAndUpload };



