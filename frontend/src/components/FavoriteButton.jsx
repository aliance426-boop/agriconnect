import React, { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import { favoriteService } from '../services/api';
import toast from 'react-hot-toast';

const FavoriteButton = ({ producerId, onToggle }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFavorite();
  }, [producerId]);

  const checkFavorite = async () => {
    try {
      const response = await favoriteService.checkFavorite(producerId);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Erreur lors de la vérification du favori:', error);
    }
  };

  const handleToggle = async (e) => {
    e.stopPropagation(); // Empêcher la sélection du producteur
    if (loading) return;

    setLoading(true);
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(producerId);
        setIsFavorite(false);
        toast.success('Retiré des favoris');
      } else {
        await favoriteService.addFavorite(producerId);
        setIsFavorite(true);
        toast.success('Ajouté aux favoris');
      }
      // Appeler le callback pour mettre à jour la liste des favoris
      if (onToggle) {
        // Petit délai pour s'assurer que le serveur a bien enregistré
        setTimeout(() => {
          onToggle();
        }, 100);
      }
    } catch (error) {
      console.error('Erreur lors de la modification du favori:', error);
      toast.error('Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-all duration-200 ${
        isFavorite
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <ThumbsUp 
        className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${
          isFavorite ? 'fill-current' : ''
        }`}
      />
    </button>
  );
};

export default FavoriteButton;
