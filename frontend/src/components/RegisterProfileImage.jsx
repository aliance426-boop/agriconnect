import React, { useState } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';
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

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    onImageChange(null);
    const fileInput = document.getElementById('register-profile-image-input');
    if (fileInput) fileInput.value = '';
  };

  const getDefaultAvatar = () => {
    switch (role) {
      case 'PRODUCER':
        return '/images/default-avatars/producer-default.svg';
      case 'MERCHANT':
        return '/images/default-avatars/merchant-default.svg';
      default:
        return '/images/default-avatars/producer-default.svg';
    }
  };

  return (
    <div className="space-y-4">
      <label className="label">Photo de profil (optionnel)</label>
      
      <div className="flex items-center space-x-4">
        {/* Photo de profil actuelle */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                alt="Aperçu de la photo de profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={getDefaultAvatar()}
                alt={`Avatar par défaut ${role === 'PRODUCER' ? 'Producteur' : 'Commerçant'}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Bouton d'upload */}
        <div className="space-y-2">
          <label
            htmlFor="register-profile-image-input"
            className="btn-outline cursor-pointer flex items-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span>Choisir une photo</span>
          </label>
          
          <input
            id="register-profile-image-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {selectedFile && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Supprimer</span>
            </button>
          )}
          
          <p className="text-xs text-gray-500">
            JPG, PNG ou GIF (max 5MB)
          </p>
        </div>
      </div>

      {/* Message d'information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 <strong>Conseil :</strong> Ajouter une photo de profil aide les autres utilisateurs à vous reconnaître et renforce la confiance dans vos échanges.
        </p>
      </div>
    </div>
  );
};

export default RegisterProfileImage;
