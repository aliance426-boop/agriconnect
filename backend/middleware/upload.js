const multer = require('multer');
const path = require('path');
const config = require('../config');

// Si Cloudinary est configuré, l'utiliser
let upload, optimizeUploadedImage;

if (config.USE_CLOUDINARY && config.CLOUDINARY_CLOUD_NAME) {
  // Utiliser Cloudinary en production
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET
  });

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
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
          { width: 1920, height: 1920, crop: 'limit', quality: 'auto:good' }
        ],
        resource_type: 'image'
      };
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées!'), false);
    }
  };

  upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: fileFilter
  });

  // Middleware pour Cloudinary - l'image est déjà uploadée
  optimizeUploadedImage = async (req, res, next) => {
    if (req.file && req.file.path) {
      // Cloudinary retourne l'URL dans req.file.path
      // On stocke l'URL complète dans req.file.cloudinaryUrl
      req.file.cloudinaryUrl = req.file.path;
      // Pour compatibilité, on garde aussi le filename
      req.file.filename = req.file.filename || path.basename(req.file.path);
    }
    next();
  };
} else {
  // Utiliser le système de fichiers local en développement
  const { optimizeImage } = require('./imageOptimizer');
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées!'), false);
    }
  };

  upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: fileFilter
  });

  // Middleware pour optimiser les images locales
  optimizeUploadedImage = async (req, res, next) => {
    if (req.file) {
      try {
        const imagePath = req.file.path;
        await optimizeImage(imagePath, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 85,
          format: 'auto'
        });
      } catch (error) {
        console.error('Erreur lors de l\'optimisation de l\'image:', error);
      }
    }
    next();
  };
}

module.exports = { upload, optimizeUploadedImage };
