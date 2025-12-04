import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  ShoppingCart, 
  MessageCircle, 
  TrendingUp, 
  CheckCircle,
  ArrowRight,
  Leaf,
  Smartphone,
  Menu,
  X
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: "Connexion Directe",
      description: "Mettez en relation producteurs et commerçants pour des échanges directs et efficaces."
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-primary-600" />,
      title: "Conseiller IA",
      description: "Chatbot intelligent spécialisé en agriculture pour des conseils personnalisés."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary-600" />,
      title: "Gestion des Commandes",
      description: "Système complet de commandes avec suivi en temps réel."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-primary-600" />,
      title: "Intégration WhatsApp",
      description: "Contact direct via WhatsApp pour une communication fluide."
    }
  ];

  const benefits = [
    "Augmentation des revenus agricoles",
    "Réduction des intermédiaires",
    "Accès à des conseils agricoles experts",
    "Gestion simplifiée des commandes",
    "Réseau de contacts élargi",
    "Suivi des prix du marché"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" />
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">AgriConnect</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Bonjour, {user?.firstName} !
                  </span>
                  <Link
                    to={user?.role === 'PRODUCER' ? '/dashboard' : '/merchant'}
                    className="btn-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mon Tableau de Bord
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 animate-slide-up">
              <nav className="flex flex-col space-y-3">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-2 text-sm text-gray-700 dark:text-gray-300">
                      Bonjour, {user?.firstName} !
                    </div>
                    <Link
                      to={user?.role === 'PRODUCER' ? '/dashboard' : '/merchant'}
                      className="btn-primary w-full text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mon Tableau de Bord
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-center font-medium transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary w-full text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      S'inscrire
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Connectez-vous à l'
              <span className="text-primary-600 dark:text-primary-400">Agriculture</span>
              <br />
              de Demain
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              AgriConnect révolutionne l'agriculture au Burkina Faso en connectant directement 
              producteurs et commerçants avec l'aide de l'intelligence artificielle.
            </p>
            
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary text-lg px-8 py-3">
                  Commencer Maintenant
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Link>
                <Link to="/login" className="btn-outline text-lg px-8 py-3">
                  Se Connecter
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Fonctionnalités Principales
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Découvrez comment AgriConnect transforme votre activité agricole
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-20 bg-primary-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Pourquoi Choisir AgriConnect ?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
                Notre plateforme offre des avantages concrets pour tous les acteurs 
                de la chaîne agricole au Burkina Faso.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg transition-colors duration-300">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Rejoignez la Révolution Agricole
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Inscrivez-vous</h4>
                    <p className="text-gray-600">Créez votre compte producteur ou commerçant</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Connectez-vous</h4>
                    <p className="text-gray-600">Trouvez des partenaires et publiez vos produits</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Développez</h4>
                    <p className="text-gray-600">Utilisez l'IA pour optimiser vos rendements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-12 sm:py-20 bg-primary-600 dark:bg-primary-700 transition-colors duration-300">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Prêt à Transformer Votre Agriculture ?
            </h2>
            <p className="text-lg sm:text-xl text-primary-100 mb-6 sm:mb-8">
              Rejoignez des milliers de producteurs et commerçants qui font confiance à AgriConnect
            </p>
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200 inline-flex items-center"
            >
              Commencer Gratuitement
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-8 sm:py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
              <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400" />
              <span className="text-xl sm:text-2xl font-bold">AgriConnect</span>
            </div>
            <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">
              Connecter l'agriculture au Burkina Faso avec l'intelligence artificielle
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              © 2024 AgriConnect. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;


