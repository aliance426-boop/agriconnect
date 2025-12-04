import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productService, orderService, chatbotService } from '../services/api';
import { 
  Plus, 
  Package, 
  ShoppingCart, 
  MessageCircle, 
  User, 
  LogOut,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

// Composants
import ProductForm from '../components/ProductForm';
import Chatbot from '../components/Chatbot';
import OrdersList from '../components/OrdersList';
import ProfileImageUpload from '../components/ProfileImageUpload';
import UserAvatar from '../components/UserAvatar';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import ActiveFilters from '../components/ActiveFilters';
import StockIndicator from '../components/StockIndicator';
import Pagination from '../components/Pagination';
import ThemeToggle from '../components/ThemeToggle';
import { getImageUrl } from '../utils/imageUtils';

// Hooks
import { useFilters } from '../hooks/useFilters';

const ProducerDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productsPagination, setProductsPagination] = useState({
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

  // Configuration des filtres pour les produits
  const productFilterConfig = {
    searchFields: ['title', 'description', 'category'],
    filters: [
      {
        key: 'category',
        label: 'Catégorie',
        field: 'category',
        type: 'select',
        options: [
          { value: 'all', label: 'Toutes les catégories' },
          { value: 'Légumes', label: 'Légumes' },
          { value: 'Fruits', label: 'Fruits' },
          { value: 'Céréales', label: 'Céréales' },
          { value: 'Tubercules', label: 'Tubercules' },
          { value: 'Épices', label: 'Épices' },
          { value: 'Autres', label: 'Autres' }
        ]
      },
      {
        key: 'stock',
        label: 'Stock',
        field: 'quantity',
        type: 'select',
        options: [
          { value: 'all', label: 'Tous les stocks' },
          { value: 'in-stock', label: 'En stock' },
          { value: 'low-stock', label: 'Stock faible' },
          { value: 'out-of-stock', label: 'Rupture de stock' }
        ]
      }
    ]
  };

  // Hook pour gérer les filtres des produits
  const {
    filters: productFilters,
    searchTerm: productSearchTerm,
    filteredData: filteredProducts,
    activeFilters: activeProductFilters,
    updateFilter: updateProductFilter,
    removeFilter: removeProductFilter,
    clearAllFilters: clearAllProductFilters,
    setSearchTerm: setProductSearchTerm,
    clearSearch: clearProductSearch
  } = useFilters(products, productFilterConfig);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (productsPage = 1, ordersPage = 1) => {
    try {
      setLoading(true);
      const [productsData, ordersData, conversationsData] = await Promise.all([
        productService.getMyProducts(productsPage, 12),
        orderService.getMyOrders(ordersPage, 10),
        chatbotService.getConversations()
      ]);

      // Gérer la réponse paginée des produits
      if (productsData.data.products) {
        setProducts(productsData.data.products);
        setProductsPagination(productsData.data.pagination);
      } else {
        // Rétrocompatibilité si pas de pagination
        setProducts(productsData.data);
      }

      // Gérer la réponse paginée des commandes
      if (ordersData.data.orders) {
        setOrders(ordersData.data.orders);
        setOrdersPagination(ordersData.data.pagination);
      } else {
        // Rétrocompatibilité si pas de pagination
        setOrders(ordersData.data);
      }

      setConversations(conversationsData.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleProductsPageChange = (page) => {
    loadData(page, ordersPagination.currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrdersPageChange = (page) => {
    loadData(productsPagination.currentPage, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fonction pour recharger uniquement les conversations sans afficher le loading
  const reloadConversations = async () => {
    try {
      const conversationsData = await chatbotService.getConversations();
      setConversations(conversationsData.data);
    } catch (error) {
      // Erreur silencieuse pour ne pas perturber l'utilisateur
      console.error('Erreur lors du rechargement des conversations:', error);
    }
  };

  const handleProductSubmit = async (productData) => {
    try {
      if (editingProduct) {
        const response = await productService.update(editingProduct._id, productData);
        toast.success('Produit modifié avec succès');
        
        // Mise à jour immédiate de l'état local
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product._id === editingProduct._id 
              ? { ...product, ...response.data.product }
              : product
          )
        );
        
        // Notifier les autres composants du changement
        window.dispatchEvent(new CustomEvent('productUpdated', { 
          detail: { product: response.data.product, producerId: user._id } 
        }));
      } else {
        const response = await productService.create(productData);
        toast.success('Produit créé avec succès');
        
        // Ajout immédiat du nouveau produit à l'état local
        setProducts(prevProducts => [response.data.product, ...prevProducts]);
        
        // Notifier les autres composants du changement
        window.dispatchEvent(new CustomEvent('productCreated', { 
          detail: { product: response.data.product, producerId: user._id } 
        }));
      }
      
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde du produit');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await productService.delete(productId);
        toast.success('Produit supprimé avec succès');
        
        // Mise à jour immédiate de l'état local sans recharger
        setProducts(prevProducts => prevProducts.filter(product => product._id !== productId));
        
        // Notifier les autres composants du changement
        window.dispatchEvent(new CustomEvent('productDeleted', { 
          detail: { productId, producerId: user._id } 
        }));
      } catch (error) {
        toast.error('Erreur lors de la suppression du produit');
      }
    }
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await orderService.updateStatus(orderId, status);
      toast.success('Statut de la commande mis à jour');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'ACCEPTED': return 'text-green-600 bg-green-100';
      case 'REFUSED': return 'text-red-600 bg-red-100';
      case 'DELIVERED': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'ACCEPTED': return <CheckCircle className="w-4 h-4" />;
      case 'REFUSED': return <XCircle className="w-4 h-4" />;
      case 'DELIVERED': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden overscroll-x-none" style={{ touchAction: 'pan-y pinch-zoom', maxWidth: '100vw' }}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300" style={{ touchAction: 'none', overscrollBehavior: 'none' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ touchAction: 'none' }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Tableau de Bord Producteur
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              <UserAvatar user={user} size="md" />
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Producteur</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden" style={{ touchAction: 'pan-y pinch-zoom' }}>
        {/* Navigation Tabs */}
        <div className="mb-8 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide" style={{ touchAction: 'pan-x', overscrollBehaviorX: 'none', overscrollBehaviorY: 'none' }}>
          <nav className="flex space-x-2 sm:space-x-4 md:space-x-8 min-w-max" style={{ touchAction: 'pan-x' }}>
            {[
              { id: 'products', label: 'Mes Produits', icon: Package },
              { id: 'orders', label: 'Commandes', icon: ShoppingCart },
              { id: 'chatbot', label: 'Conseiller IA', icon: MessageCircle },
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
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Mes Produits ({filteredProducts.length} sur {products.length})
                </h2>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductForm(true);
                  }}
                  className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Ajouter un produit</span>
                </button>
              </div>

              {/* Barre de recherche et filtres */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <SearchBar
                      value={productSearchTerm}
                      onChange={setProductSearchTerm}
                      placeholder="Rechercher par nom, description ou catégorie..."
                      onClear={clearProductSearch}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <FilterDropdown
                      label="Catégorie"
                      options={productFilterConfig.filters[0].options}
                      value={productFilters.category || 'all'}
                      onChange={(value) => updateProductFilter('category', value)}
                      placeholder="Toutes les catégories"
                    />
                    <FilterDropdown
                      label="Stock"
                      options={productFilterConfig.filters[1].options}
                      value={productFilters.stock || 'all'}
                      onChange={(value) => updateProductFilter('stock', value)}
                      placeholder="Tous les stocks"
                    />
                  </div>
                </div>

                {/* Filtres actifs */}
                <ActiveFilters
                  filters={activeProductFilters}
                  onRemoveFilter={removeProductFilter}
                  onClearAll={clearAllProductFilters}
                />
              </div>

              {products.length === 0 ? (
                <div className="card text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun produit
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Commencez par ajouter vos premiers produits
                  </p>
                  <button
                    onClick={() => setShowProductForm(true)}
                    className="btn-primary"
                  >
                    Ajouter un produit
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="card text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun produit trouvé
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Aucun produit ne correspond à vos critères de recherche
                  </p>
                  <button
                    onClick={clearAllProductFilters}
                    className="btn-outline"
                  >
                    Effacer les filtres
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProducts.map((product, index) => (
                    <div key={product._id} className="card animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                      {product.image && (
                        <div className="aspect-w-16 aspect-h-9 mb-4">
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {product.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {product.category}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-primary-600">
                            {product.price} FCFA
                          </span>
                          <div className="flex flex-col items-end space-y-1">
                            <span className="text-sm text-gray-600">
                              Stock: {product.quantity}
                            </span>
                            <StockIndicator quantity={product.quantity} />
                          </div>
                        </div>
                        
                        {product.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductForm(true);
                            }}
                            className="flex-1 btn-outline text-sm flex items-center justify-center"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination pour les produits */}
              {productsPagination.totalPages > 1 && (
                <Pagination
                  currentPage={productsPagination.currentPage}
                  totalPages={productsPagination.totalPages}
                  totalItems={productsPagination.totalItems}
                  itemsPerPage={productsPagination.itemsPerPage}
                  onPageChange={handleProductsPageChange}
                />
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <OrdersList 
              orders={orders} 
              onStatusUpdate={handleOrderStatusUpdate}
              userRole="PRODUCER"
            />
          )}

          {/* Chatbot Tab */}
          {activeTab === 'chatbot' && (
            <div className="w-full -mx-4 sm:mx-0 px-2 sm:px-0 overflow-x-hidden" style={{ touchAction: 'pan-y', overscrollBehaviorX: 'none' }}>
              <Chatbot 
                conversations={conversations}
                onConversationUpdate={reloadConversations}
              />
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
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
                    <label className="label">Rôle</label>
                    <p className="text-gray-900">Producteur</p>
                  </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleProductSubmit}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default ProducerDashboard;


