const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Optimise une image : compression, redimensionnement, etc.
 * @param {string} imagePath - Chemin vers l'image à optimiser
 * @param {object} options - Options d'optimisation
 * @returns {Promise<string>} - Chemin de l'image optimisée
 */
const optimizeImage = async (imagePath, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 85,
    format = 'jpeg' // 'jpeg', 'png', 'webp'
  } = options;

  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    // Déterminer le format de sortie
    let outputFormat = format;
    if (format === 'auto') {
      // Conserver le format original si c'est PNG (pour transparence), sinon JPEG
      outputFormat = metadata.format === 'png' ? 'png' : 'jpeg';
    }

    // Calculer les nouvelles dimensions si nécessaire
    let width = metadata.width;
    let height = metadata.height;
    let shouldResize = false;

    if (width > maxWidth || height > maxHeight) {
      shouldResize = true;
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Préparer l'image pour l'optimisation
    let pipeline = image;

    // Redimensionner si nécessaire
    if (shouldResize) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Optimiser selon le format
    if (outputFormat === 'jpeg') {
      pipeline = pipeline.jpeg({
        quality: quality,
        progressive: true,
        mozjpeg: true
      });
    } else if (outputFormat === 'png') {
      pipeline = pipeline.png({
        quality: quality,
        compressionLevel: 9,
        adaptiveFiltering: true
      });
    } else if (outputFormat === 'webp') {
      pipeline = pipeline.webp({
        quality: quality
      });
    }

    // Générer le nom du fichier optimisé
    const ext = path.extname(imagePath);
    const optimizedPath = imagePath.replace(ext, `-optimized${ext}`);

    // Sauvegarder l'image optimisée
    await pipeline.toFile(optimizedPath);

    // Remplacer l'original par l'optimisé
    await fs.rename(optimizedPath, imagePath);

    // Obtenir la taille du fichier pour logging
    const stats = await fs.stat(imagePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ Image optimisée: ${path.basename(imagePath)} (${sizeInMB} MB)`);

    return imagePath;
  } catch (error) {
    console.error('Erreur lors de l\'optimisation de l\'image:', error);
    // En cas d'erreur, retourner le chemin original
    return imagePath;
  }
};

/**
 * Génère un thumbnail d'une image
 * @param {string} imagePath - Chemin vers l'image
 * @param {number} size - Taille du thumbnail (carré)
 * @returns {Promise<string>} - Chemin du thumbnail
 */
const generateThumbnail = async (imagePath, size = 300) => {
  try {
    const ext = path.extname(imagePath);
    const thumbnailPath = imagePath.replace(ext, `-thumb${ext}`);

    await sharp(imagePath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  } catch (error) {
    console.error('Erreur lors de la génération du thumbnail:', error);
    return null;
  }
};

module.exports = {
  optimizeImage,
  generateThumbnail
};


