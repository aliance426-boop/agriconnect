import React, { useState } from 'react';
import { Camera, X, User } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterProfileImage = ({ onImageChange, role }) => {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La taille du fichier ne doit pas dépasser 5MB');
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error('Seules les images sont autorisées');
        return;
      }

      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        setSelectedFile(file);
        onImageChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    setSelectedFile(null);
    onImageChange(null);
    const fileInput = document.getElementById('register-profile-image-input');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="label text-sm mb-1.5">Photo de profil (optionnel)</label>
      
      {/* Zone de sélection d'image - style moderne */}
      <div className="flex justify-center">
        <label
          htmlFor="register-profile-image-input"
          className="relative cursor-pointer group"
        >
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-primary-500 dark:group-hover:border-primary-400 transition-all duration-200 flex items-center justify-center">
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Photo de profil"
                  className="w-full h-full object-cover"
                />
                {/* Bouton supprimer sur l'image */}
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow-lg transition-colors"
                  title="Supprimer"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                <Camera className="w-6 h-6 mb-0.5" />
                <span className="text-xs font-medium">Photo</span>
              </div>
            )}
          </div>
          
          <input
            id="register-profile-image-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default RegisterProfileImage;


