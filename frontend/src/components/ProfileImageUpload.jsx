import React, { useState } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';
import { userService } from '../services/api';
import toast from 'react-hot-toast';

const ProfileImageUpload = ({ user, onImageUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);

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
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const fileInput = document.getElementById('profile-image-input');
    const file = fileInput.files[0];
    
    if (!file) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await userService.uploadProfileImage(formData);
      
      toast.success('Photo de profil mise à jour avec succès');
      setPreview(null);
      fileInput.value = '';
      
      // Notifier le composant parent
      if (onImageUpdate) {
        onImageUpdate(response.data.profileImage);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload de la photo');
      console.error('Erreur upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    const fileInput = document.getElementById('profile-image-input');
    fileInput.value = '';
  };

  const getImageUrl = () => {
    if (preview) return preview;
    if (user?.profileImage) {
      return `http://localhost:5000/uploads/${user.profileImage}`;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {/* Photo de profil actuelle */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {getImageUrl() ? (
              <img
                src={getImageUrl()}
                alt="Photo de profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>
          
          {/* Indicateur de statut */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Bouton d'upload */}
        <div className="space-y-2">
          <label
            htmlFor="profile-image-input"
            className="btn-outline cursor-pointer flex items-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span>Changer la photo</span>
          </label>
          
          <input
            id="profile-image-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <p className="text-xs text-gray-500">
            JPG, PNG ou GIF (max 5MB)
          </p>
        </div>
      </div>

      {/* Aperçu et actions */}
      {preview && (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
              <img
                src={preview}
                alt="Aperçu"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Aperçu de la nouvelle photo</p>
              <p className="text-xs text-gray-500">Cliquez sur "Confirmer" pour sauvegarder</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="btn-primary flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Upload...' : 'Confirmer'}</span>
            </button>
            
            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="btn-outline flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Annuler</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
