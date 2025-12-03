const multer = require('multer');
const path = require('path');
const { optimizeImage } = require('./imageOptimizer');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
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

// Middleware pour optimiser les images après upload
const optimizeUploadedImage = async (req, res, next) => {
  if (req.file) {
    try {
      const imagePath = req.file.path;
      // Optimiser l'image : max 1920x1920, qualité 85%
      await optimizeImage(imagePath, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 85,
        format: 'auto'
      });
    } catch (error) {
      console.error('Erreur lors de l\'optimisation de l\'image:', error);
      // Continuer même en cas d'erreur d'optimisation
    }
  }
  next();
};

module.exports = { upload, optimizeUploadedImage };

