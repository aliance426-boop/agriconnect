import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService, productService, orderService, favoriteService } from '../services/api';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  User, 
  LogOut,
  Phone,
  MapPin,
  MessageCircle,
  Eye,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';

// Composants
import OrdersList from '../components/OrdersList';
import OrderForm from '../components/OrderForm';
import ProfileImageUpload from '../components/ProfileImageUpload';
import UserAvatar from '../components/UserAvatar';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import ActiveFilters from '../components/ActiveFilters';
import StockIndicator from '../components/StockIndicator';
import Pagination from '../components/Pagination';
import ThemeToggle from '../components/ThemeToggle';
import FavoriteButton from '../components/FavoriteButton';
import { getImageUrl } from '../utils/imageUtils';

// Hooks
import { useFilters } from '../hooks/useFilters';
import { getLocationFilterOptions } from '../utils/locations';

const MerchantDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('producers');
  const [producers, setProducers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [producerProducts, setProducerProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsCache, setProductsCache] = useState({}); // Cache pour les produits
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [producersPagination, setProducersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });
  const [ordersPagination, setOrdersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Configuration des filtres pour les producteurs
  const producerFilterConfig = {
    searchFields: ['firstName', 'lastName', 'location', 'phone'],
    filters: [
      {
        key: 'location',
        label: 'Localisation',
        field: 'location',
        type: 'select',
        options: [
          { value: 'all', label: 'Toutes les localisations' },
          ...getLocationFilterOptions()
        ]
      }
    ]
  };

  // Hook pour gérer les filtres des producteurs
  const {
    filters: producerFilters,
    searchTerm: producerSearchTerm,
    filteredData: filteredProducers,
    activeFilters: activeProducerFilters,
    updateFilter: updateProducerFilter,
    removeFilter: removeProducerFilter,
    clearAllFilters: clearAllProducerFilters,
    setSearchTerm: setProducerSearchTerm,
    clearSearch: clearProducerSearch
  } = useFilters(producers, producerFilterConfig);

  useEffect(() => {
    loadData();
    
    // Écouter les événements de suppression de produits
    const handleProductDeleted = (event) => {
      const { productId, producerId } = event.detail;
      
      // Si c'est un produit du producteur sélectionné, mettre à jour la liste
      if (selectedProducer && selectedProducer._id === producerId) {
        setProducerProducts(prevProducts => 
          prevProducts.filter(product => product._id !== productId)
        );
      }
    };
    
    // Écouter les événements de modification de produits
    const handleProductUpdated = (event) => {
      const { product, producerId } = event.detail;
      
      // Si c'est un produit du producteur sélectionné, mettre à jour la liste
      if (selectedProducer && selectedProducer._id === producerId) {
        setProducerProducts(prevProducts => 
          prevProducts.map(p => p._id === product._id ? product : p)
        );
      }
    };
    
    // Écouter les événements de création de produits
    const handleProductCreated = (event) => {
      const { product, producerId } = event.detail;
      
      // Si c'est un produit du producteur sélectionné, ajouter à la liste
      if (selectedProducer && selectedProducer._id === producerId) {
        setProducerProducts(prevProducts => [product, ...prevProducts]);
      }
    };
    
    window.addEventListener('productDeleted', handleProductDeleted);
    window.addEventListener('productUpdated', handleProductUpdated);
    window.addEventListener('productCreated', handleProductCreated);
    
    return () => {
      window.removeEventListener('productDeleted', handleProductDeleted);
      window.removeEventListener('productUpdated', handleProductUpdated);
      window.removeEventListener('productCreated', handleProductCreated);
    };
  }, [selectedProducer]);

  const loadFavorites = async () => {
    try {
      const favoritesData = await favoriteService.getFavorites().catch(() => ({ data: [] }));
      setFavorites(favoritesData.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    }
  };

  const loadData = async (producersPage = 1, ordersPage = 1) => {
    try {
      setLoading(true);
      const [producersData, ordersData, favoritesData] = await Promise.all([
        userService.getProducers(producersPage, 12),
        orderService.getMyOrders(ordersPage, 10),
        favoriteService.getFavorites().catch(() => ({ data: [] })) // Ignorer erreur si pas de favoris
      ]);

      // Gérer la réponse paginée des producteurs
      if (producersData.data.producers) {
        setProducers(producersData.data.producers);
        setProducersPagination(producersData.data.pagination);
      } else {
        // Rétrocompatibilité si pas de pagination
        setProducers(producersData.data);
      }

      // Gérer la réponse paginée des commandes
      if (ordersData.data.orders) {
        setOrders(ordersData.data.orders);
        setOrdersPagination(ordersData.data.pagination);
      } else {
        // Rétrocompatibilité si pas de pagination
        setOrders(ordersData.data);
      }

      // Gérer les favoris
      setFavorites(favoritesData.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleProducersPageChange = (page) => {
    loadData(page, ordersPagination.currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrdersPageChange = (page) => {
    loadData(producersPagination.currentPage, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadProducerProducts = async (producerId, forceRefresh = false) => {
    // Vérifier le cache seulement si pas de force refresh
    if (!forceRefresh && productsCache[producerId]) {
      setProducerProducts(productsCache[producerId]);
      return;
    }

    setLoadingProducts(true);
    try {
      const response = await productService.getAll({ producerId });
      // Gérer la réponse paginée ou non paginée
      let products = [];
      if (response.data.products) {
        products = response.data.products;
      } else {
        // Rétrocompatibilité si pas de pagination (tableau direct)
        products = Array.isArray(response.data) ? response.data : [];
      }
      
      setProducerProducts(products);
      // Mettre en cache
      setProductsCache(prev => ({ ...prev, [producerId]: products }));
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      toast.error('Erreur lors du chargement des produits');
      setProducerProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fonction pour mettre à jour les produits du producteur sélectionné
  const updateProducerProducts = (updatedProducts) => {
    if (selectedProducer) {
      setProducerProducts(updatedProducts);
    }
  };

  const handleProducerSelect = (producer) => {
    setSelectedProducer(producer);
    // Réinitialiser les produits avant de charger
    setProducerProducts([]);
    // Toujours forcer le rechargement pour avoir les données les plus récentes
    loadProducerProducts(producer._id, true);
  };

  const handleOrderSubmit = async (orderData) => {
    try {
      await orderService.create(orderData);
      toast.success('Commande créée avec succès');
      setShowOrderForm(false);
      setSelectedProduct(null);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la création de la commande');
    }
  };

  const handleWhatsAppContact = (phone, producerName) => {
    const message = `Bonjour ${producerName}, je suis intéressé par vos produits agricoles.`;
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Tableau de Bord Commerçant
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              <UserAvatar user={user} size="md" />
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.companyName}</p>
              </div>
              <ThemeToggle />
              <button
                onClick={logout}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-sm sm:text-base transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
          <nav className="flex space-x-2 sm:space-x-4 md:space-x-8 min-w-max">
            {[
              { id: 'producers', label: 'Producteurs', icon: Users },
              { id: 'favorites', label: 'Favoris', icon: Heart },
              { id: 'orders', label: 'Mes Commandes', icon: ShoppingCart },
              { id: 'profile', label: 'Profil', icon: User }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 sm:space-x-2 py-2.5 px-2.5 sm:px-4 border-b-2 font-medium text-xs sm:text-sm md:text-base whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="block">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Producers Tab */}
          {activeTab === 'producers' && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Producteurs Disponibles ({filteredProducers.length} sur {producers.length})
              </h2>

              {/* Barre de recherche et filtres */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <SearchBar
                      value={producerSearchTerm}
                      onChange={setProducerSearchTerm}
                      placeholder="Rechercher par nom, localisation ou téléphone..."
                      onClear={clearProducerSearch}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <FilterDropdown
                      label="Localisation"
                      options={producerFilterConfig.filters[0].options}
                      value={producerFilters.location || 'all'}
                      onChange={(value) => updateProducerFilter('location', value)}
                      placeholder="Toutes les localisations"
                    />
                  </div>
                </div>

                {/* Filtres actifs */}
                <ActiveFilters
                  filters={activeProducerFilters}
                  onRemoveFilter={removeProducerFilter}
                  onClearAll={clearAllProducerFilters}
                />
              </div>

              {producers.length === 0 ? (
                <div className="card text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucun producteur
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Aucun producteur n'est encore inscrit sur la plateforme
                  </p>
                </div>
              ) : filteredProducers.length === 0 ? (
                <div className="card text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucun producteur trouvé
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Aucun producteur ne correspond à vos critères de recherche
                  </p>
                  <button
                    onClick={clearAllProducerFilters}
                    className="btn-outline"
                  >
                    Effacer les filtres
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Producers List */}
                  <div className="lg:col-span-1 order-2 lg:order-1">
                    <div className="space-y-4">
                      {filteredProducers.map((producer, index) => (
                        <div
                          key={producer._id}
                          className={`card cursor-pointer transition-all duration-200 animate-slide-up ${
                            selectedProducer?._id === producer._id
                              ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'hover:shadow-md dark:hover:shadow-lg'
                          }`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                          onClick={() => handleProducerSelect(producer)}
                        >
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <UserAvatar user={producer} size="md" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                                  {producer.firstName} {producer.lastName}
                                </h3>
                                <FavoriteButton 
                                  producerId={producer._id} 
                                  onToggle={loadFavorites}
                                />
                              </div>
                              <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">{producer.location}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">{producer.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination pour les producteurs */}
                    {producersPagination.totalPages > 1 && (
                      <div className="mt-4">
                        <Pagination
                          currentPage={producersPagination.currentPage}
                          totalPages={producersPagination.totalPages}
                          totalItems={producersPagination.totalItems}
                          itemsPerPage={producersPagination.itemsPerPage}
                          onPageChange={handleProducersPageChange}
                        />
                      </div>
                    )}
                  </div>

                  {/* Producer Products */}
                  <div className="lg:col-span-2 order-1 lg:order-2">
                    {selectedProducer ? (
                      <div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                            Produits de {selectedProducer.firstName} {selectedProducer.lastName}
                          </h3>
                          <button
                            onClick={() => handleWhatsAppContact(selectedProducer.phone, selectedProducer.firstName)}
                            className="btn-secondary flex items-center space-x-2 w-full sm:w-auto justify-center"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp</span>
                          </button>
                        </div>

                        {loadingProducts ? (
                          <div className="card text-center py-12">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                              <p className="text-gray-600 dark:text-gray-400">Chargement des produits...</p>
                            </div>
                          </div>
                        ) : producerProducts.length === 0 ? (
                          <div className="card text-center py-12">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                              Aucun produit
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              Ce producteur n'a pas encore publié de produits
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {producerProducts.map((product, index) => (
                              <div key={product._id} className="card animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                {product.image && (
                                  <div className="aspect-w-16 aspect-h-9 mb-4">
                                    <img
                                      src={getImageUrl(product.image)}
                                      alt={product.title}
                                      className="w-full h-32 object-cover rounded-lg"
                                    />
                                  </div>
                                )}
                                
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      {product.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {product.category}
                                    </p>
                                  </div>
                                  
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <span className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">
                                      {product.price} FCFA
                                    </span>
                                    <div className="flex flex-col items-start sm:items-end space-y-1">
                                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        Stock: {product.quantity}
                                      </span>
                                      <StockIndicator quantity={product.quantity} />
                                    </div>
                                  </div>
                                  
                                  {product.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                      {product.description}
                                    </p>
                                  )}
                                  
                                  <button
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      setShowOrderForm(true);
                                    }}
                                    disabled={product.quantity === 0}
                                    className={`w-full ${
                                      product.quantity === 0 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'btn-primary'
                                    }`}
                                  >
                                    {product.quantity === 0 ? 'Rupture de stock' : 'Commander'}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="card text-center py-12">
                        <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Sélectionnez un producteur
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Cliquez sur un producteur pour voir ses produits
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Mes Favoris ({favorites.length})
              </h2>

              {favorites.length === 0 ? (
                <div className="card text-center py-12 animate-fade-in">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucun favori
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Ajoutez des producteurs à vos favoris pour y accéder rapidement
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      {favorites.map((producer, index) => (
                        <div
                          key={producer._id}
                          className={`card cursor-pointer transition-all duration-200 animate-slide-up ${
                            selectedProducer?._id === producer._id
                              ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'hover:shadow-md dark:hover:shadow-lg'
                          }`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                          onClick={() => handleProducerSelect(producer)}
                        >
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <UserAvatar user={producer} size="md" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                                  {producer.firstName} {producer.lastName}
                                </h3>
                                <FavoriteButton 
                                  producerId={producer._id} 
                                  onToggle={() => {
                                    loadFavorites();
                                    if (selectedProducer?._id === producer._id) {
                                      setSelectedProducer(null);
                                      setProducerProducts([]);
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">{producer.location}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">{producer.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    {selectedProducer ? (
                      <div className="animate-scale-in">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                            Produits de {selectedProducer.firstName} {selectedProducer.lastName}
                          </h3>
                          <button
                            onClick={() => handleWhatsAppContact(selectedProducer.phone, selectedProducer.firstName)}
                            className="btn-secondary flex items-center space-x-2 w-full sm:w-auto justify-center"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp</span>
                          </button>
                        </div>

                        {loadingProducts ? (
                          <div className="card text-center py-12">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                              <p className="text-gray-600 dark:text-gray-400">Chargement des produits...</p>
                            </div>
                          </div>
                        ) : producerProducts.length === 0 ? (
                          <div className="card text-center py-12">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                              Aucun produit
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              Ce producteur n'a pas encore de produits disponibles
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {producerProducts.map((product, index) => (
                              <div key={product._id} className="card animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="flex flex-col sm:flex-row gap-4">
                                  <img
                                    src={getImageUrl(product.image)}
                                    alt={product.name}
                                    className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                      {product.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                      {product.description}
                                    </p>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                        {product.price.toLocaleString()} FCFA
                                      </span>
                                      <StockIndicator quantity={product.quantity} />
                                    </div>
                                    <button
                                      onClick={() => handleProductSelect(product)}
                                      disabled={product.quantity === 0}
                                      className={`w-full ${
                                        product.quantity === 0 
                                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                          : 'btn-primary'
                                      }`}
                                    >
                                      {product.quantity === 0 ? 'Rupture de stock' : 'Commander'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="card text-center py-12">
                        <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Sélectionnez un producteur
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Cliquez sur un producteur pour voir ses produits
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <>
              <OrdersList 
                orders={orders} 
                onStatusUpdate={() => {}} // Merchants can't update order status
                userRole="MERCHANT"
              />
              {ordersPagination.totalPages > 1 && (
                <Pagination
                  currentPage={ordersPagination.currentPage}
                  totalPages={ordersPagination.totalPages}
                  totalItems={ordersPagination.totalItems}
                  itemsPerPage={ordersPagination.itemsPerPage}
                  onPageChange={handleOrdersPageChange}
                />
              )}
            </>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">
                Mon Profil
              </h2>
              <div className="card">
                <div className="space-y-6">
                  {/* Photo de profil */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Photo de profil
                    </h3>
                    <ProfileImageUpload 
                      user={user} 
                      onImageUpdate={(newImage) => {
                        // Mettre à jour l'utilisateur dans le contexte
                        updateUser({ profileImage: newImage });
                      }}
                    />
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Informations personnelles
                    </h3>
                    <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Prénom</label>
                      <p className="text-gray-900">{user?.firstName}</p>
                    </div>
                    <div>
                      <label className="label">Nom</label>
                      <p className="text-gray-900">{user?.lastName}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="label">Email</label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  
                  <div>
                    <label className="label">Téléphone</label>
                    <p className="text-gray-900">{user?.phone}</p>
                  </div>
                  
                  <div>
                    <label className="label">Localisation</label>
                    <p className="text-gray-900">{user?.location}</p>
                  </div>
                  
                  <div>
                    <label className="label">Entreprise</label>
                    <p className="text-gray-900">{user?.companyName}</p>
                  </div>
                  
                  <div>
                    <label className="label">Rôle</label>
                    <p className="text-gray-900">Commerçant</p>
                  </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && selectedProduct && (
        <OrderForm
          product={selectedProduct}
          producer={selectedProducer}
          onSubmit={handleOrderSubmit}
          onClose={() => {
            setShowOrderForm(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default MerchantDashboard;


