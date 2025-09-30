import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService, productService, orderService } from '../services/api';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  User, 
  LogOut,
  Phone,
  MapPin,
  MessageCircle,
  Eye
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

// Hooks
import { useFilters } from '../hooks/useFilters';

const MerchantDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('producers');
  const [producers, setProducers] = useState([]);
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [producerProducts, setProducerProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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
          { value: 'Abidjan', label: 'Abidjan' },
          { value: 'Bouaké', label: 'Bouaké' },
          { value: 'Daloa', label: 'Daloa' },
          { value: 'Korhogo', label: 'Korhogo' },
          { value: 'San-Pédro', label: 'San-Pédro' },
          { value: 'Yamoussoukro', label: 'Yamoussoukro' },
          { value: 'Autres', label: 'Autres' }
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
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [producersData, ordersData] = await Promise.all([
        userService.getProducers(),
        orderService.getMyOrders()
      ]);

      setProducers(producersData.data);
      setOrders(ordersData.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadProducerProducts = async (producerId) => {
    try {
      const response = await productService.getAll({ producerId });
      setProducerProducts(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des produits');
    }
  };

  const handleProducerSelect = (producer) => {
    setSelectedProducer(producer);
    loadProducerProducts(producer._id);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Tableau de Bord Commerçant
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <UserAvatar user={user} size="md" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500">{user?.companyName}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'producers', label: 'Producteurs', icon: Users },
              { id: 'orders', label: 'Mes Commandes', icon: ShoppingCart },
              { id: 'profile', label: 'Profil', icon: User }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Producers Tab */}
          {activeTab === 'producers' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
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
                  <div className="flex gap-3">
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun producteur
                  </h3>
                  <p className="text-gray-600">
                    Aucun producteur n'est encore inscrit sur la plateforme
                  </p>
                </div>
              ) : filteredProducers.length === 0 ? (
                <div className="card text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun producteur trouvé
                  </h3>
                  <p className="text-gray-600 mb-4">
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
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Producers List */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      {filteredProducers.map((producer) => (
                        <div
                          key={producer._id}
                          className={`card cursor-pointer transition-colors ${
                            selectedProducer?._id === producer._id
                              ? 'ring-2 ring-primary-500 bg-primary-50'
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => handleProducerSelect(producer)}
                        >
                          <div className="flex items-start space-x-3">
                            <UserAvatar user={producer} size="md" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900">
                                {producer.firstName} {producer.lastName}
                              </h3>
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{producer.location}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{producer.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Producer Products */}
                  <div className="lg:col-span-2">
                    {selectedProducer ? (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Produits de {selectedProducer.firstName} {selectedProducer.lastName}
                          </h3>
                          <button
                            onClick={() => handleWhatsAppContact(selectedProducer.phone, selectedProducer.firstName)}
                            className="btn-secondary flex items-center space-x-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp</span>
                          </button>
                        </div>

                        {producerProducts.length === 0 ? (
                          <div className="card text-center py-12">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              Aucun produit
                            </h4>
                            <p className="text-gray-600">
                              Ce producteur n'a pas encore publié de produits
                            </p>
                          </div>
                        ) : (
                          <div className="grid md:grid-cols-2 gap-4">
                            {producerProducts.map((product) => (
                              <div key={product._id} className="card">
                                {product.image && (
                                  <div className="aspect-w-16 aspect-h-9 mb-4">
                                    <img
                                      src={`http://localhost:5000/uploads/${product.image}`}
                                      alt={product.title}
                                      className="w-full h-32 object-cover rounded-lg"
                                    />
                                  </div>
                                )}
                                
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {product.title}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {product.category}
                                    </p>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-primary-600">
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
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Sélectionnez un producteur
                        </h3>
                        <p className="text-gray-600">
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
            <OrdersList 
              orders={orders} 
              onStatusUpdate={() => {}} // Merchants can't update order status
              userRole="MERCHANT"
            />
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
                  <div className="grid grid-cols-2 gap-4">
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


