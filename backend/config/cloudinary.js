const cloudinary = require('cloudinary').v2;
const config = require('../config');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || config.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || config.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || config.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;



