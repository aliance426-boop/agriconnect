import { useState, useMemo } from 'react';

export const useFilters = (data, filterConfig) => {
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Fonction pour mettre à jour un filtre
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' || value === '' ? undefined : value
    }));
  };

  // Fonction pour supprimer un filtre
  const removeFilter = (key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  // Fonction pour effacer tous les filtres
  const clearAllFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // Fonction pour effacer la recherche
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Données filtrées
  const filteredData = useMemo(() => {
    let result = [...data];

    // Appliquer la recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(item => {
        return filterConfig.searchFields.some(field => {
          // Gestion des champs imbriqués (ex: productId.title)
          const fieldParts = field.split('.');
          let value = item;
          
          for (const part of fieldParts) {
            value = value?.[part];
            if (value === undefined || value === null) break;
          }
          
          return value && value.toString().toLowerCase().includes(searchLower);
        });
      });
    }

    // Appliquer les filtres
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        const filterConfig_item = filterConfig.filters.find(f => f.key === key);
        if (filterConfig_item) {
          result = result.filter(item => {
            const itemValue = item[filterConfig_item.field];
            if (filterConfig_item.type === 'select') {
              // Gestion spéciale pour les filtres de stock
              if (key === 'stock') {
                switch (value) {
                  case 'in-stock':
                    return itemValue > 10;
                  case 'low-stock':
                    return itemValue > 0 && itemValue <= 10;
                  case 'out-of-stock':
                    return itemValue === 0;
                  default:
                    return true;
                }
              }
              
              // Gestion spéciale pour les filtres de date
              if (key === 'dateRange') {
                const now = new Date();
                const itemDate = new Date(itemValue);
                
                switch (value) {
                  case 'today':
                    return itemDate.toDateString() === now.toDateString();
                  case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return itemDate >= weekAgo;
                  case 'month':
                    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
                    return itemDate >= monthAgo;
                  case 'last-month':
                    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                    return itemDate >= lastMonthStart && itemDate <= lastMonthEnd;
                  default:
                    return true;
                }
              }
              
              // Gestion spéciale pour les filtres de montant
              if (key === 'amountRange') {
                switch (value) {
                  case 'low':
                    return itemValue < 10000;
                  case 'medium':
                    return itemValue >= 10000 && itemValue <= 50000;
                  case 'high':
                    return itemValue > 50000;
                  default:
                    return true;
                }
              }
              return itemValue === value;
            } else if (filterConfig_item.type === 'range') {
              return itemValue >= value.min && itemValue <= value.max;
            }
            return true;
          });
        }
      }
    });

    return result;
  }, [data, filters, searchTerm, filterConfig]);

  // Obtenir les filtres actifs pour l'affichage
  const activeFilters = useMemo(() => {
    const active = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        const filterConfig_item = filterConfig.filters.find(f => f.key === key);
        if (filterConfig_item) {
          const option = filterConfig_item.options?.find(opt => opt.value === value);
          active.push({
            key,
            label: filterConfig_item.label,
            value: option ? option.label : value
          });
        }
      }
    });

    if (searchTerm) {
      active.push({
        key: 'search',
        label: 'Recherche',
        value: `"${searchTerm}"`
      });
    }

    return active;
  }, [filters, searchTerm, filterConfig]);

  return {
    filters,
    searchTerm,
    filteredData,
    activeFilters,
    updateFilter,
    removeFilter,
    clearAllFilters,
    setSearchTerm,
    clearSearch
  };
};
