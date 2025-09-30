import React from 'react';
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
  Smartphone
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Leaf className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">AgriConnect</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">
                    Bonjour, {user?.firstName} !
                  </span>
                  <Link
                    to={user?.role === 'PRODUCER' ? '/dashboard' : '/merchant'}
                    className="btn-primary"
                  >
                    Mon Tableau de Bord
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary-600">
                    Connexion
                  </Link>
                  <Link to="/register" className="btn-primary">
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Connectez-vous à l'
              <span className="text-primary-600">Agriculture</span>
              <br />
              de Demain
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez comment AgriConnect transforme votre activité agricole
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Pourquoi Choisir AgriConnect ?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Notre plateforme offre des avantages concrets pour tous les acteurs 
                de la chaîne agricole au Burkina Faso.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
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
        <section className="py-20 bg-primary-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à Transformer Votre Agriculture ?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Leaf className="w-8 h-8 text-primary-400" />
              <span className="text-2xl font-bold">AgriConnect</span>
            </div>
            <p className="text-gray-400 mb-4">
              Connecter l'agriculture au Burkina Faso avec l'intelligence artificielle
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 AgriConnect. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;


