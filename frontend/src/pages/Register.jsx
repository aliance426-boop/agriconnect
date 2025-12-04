import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Building, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import RegisterProfileImage from '../components/RegisterProfileImage';
import { BURKINA_FASO_LOCATIONS } from '../utils/locations';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    role: 'PRODUCER',
    companyName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [customLocation, setCustomLocation] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'location') {
      if (value === 'Autres') {
        // Si "Autres" est sélectionné, garder "Autres" dans formData mais réinitialiser customLocation
        setFormData({
          ...formData,
          location: 'Autres'
        });
        setCustomLocation('');
      } else {
        // Si une localisation de la liste est sélectionnée, l'utiliser directement
        setFormData({
          ...formData,
          location: value
        });
        setCustomLocation('');
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCustomLocationChange = (e) => {
    const value = e.target.value;
    setCustomLocation(value);
    // Mettre à jour formData.location avec la valeur personnalisée
    setFormData({
      ...formData,
      location: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation côté client
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    // Validation de la localisation
    if (!formData.location || formData.location === '') {
      toast.error('Veuillez sélectionner ou saisir une localisation');
      setLoading(false);
      return;
    }

    if (formData.location === 'Autres' && !customLocation) {
      toast.error('Veuillez saisir votre localisation');
      setLoading(false);
      return;
    }

    try {
      // Préparer les données pour l'envoi
      const { confirmPassword, ...dataToSend } = formData;
      
      // Si une image de profil est sélectionnée, l'ajouter aux données
      if (profileImage) {
        dataToSend.profileImage = profileImage;
      }
      
      const result = await register(dataToSend);
      
      if (result.success) {
        toast.success('Inscription réussie !');
        // Rediriger selon le rôle
        if (result.data.user.role === 'PRODUCER') {
          navigate('/dashboard');
        } else {
          navigate('/merchant');
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-3 text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </Link>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Créer un compte
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Rejoignez la communauté AgriConnect
          </p>
        </div>

        {/* Form */}
        <div className="card p-5 sm:p-6">
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="label text-sm mb-2">Je suis un :</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative">
                  <input
                    type="radio"
                    name="role"
                    value="PRODUCER"
                    checked={formData.role === 'PRODUCER'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`p-2.5 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === 'PRODUCER' 
                      ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-sm' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-600'
                  }`}>
                    <div className="text-center">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">Producteur</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Vendre</div>
                    </div>
                  </div>
                </label>
                
                <label className="relative">
                  <input
                    type="radio"
                    name="role"
                    value="MERCHANT"
                    checked={formData.role === 'MERCHANT'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`p-2.5 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === 'MERCHANT' 
                      ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-sm' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-600'
                  }`}>
                    <div className="text-center">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">Commerçant</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Acheter</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Photo de profil */}
            <RegisterProfileImage 
              onImageChange={setProfileImage}
              role={formData.role}
            />

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="label text-sm mb-1.5">
                  Prénom
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="input-field pl-9 text-sm py-2"
                    placeholder="Prénom"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="lastName" className="label text-sm mb-1.5">
                  Nom
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="input-field pl-9 text-sm py-2"
                    placeholder="Nom"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label text-sm mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field pl-9 text-sm py-2"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="label text-sm mb-1.5">
                Téléphone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="input-field pl-9 text-sm py-2"
                  placeholder="+226 XX XX XX XX"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="label text-sm mb-1.5">
                Localisation
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none z-10">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="location"
                  name="location"
                  required={!customLocation}
                  className="input-field pl-9 text-sm py-2 appearance-none bg-white dark:bg-gray-700"
                  value={customLocation ? 'Autres' : (formData.location || '')}
                  onChange={handleChange}
                >
                  <option value="">Sélectionnez...</option>
                  {BURKINA_FASO_LOCATIONS.map((location) => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Champ de saisie manuelle si "Autres" est sélectionné */}
              {(formData.location === 'Autres' || customLocation) && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Saisissez votre localisation"
                    required
                    className="input-field text-sm py-2"
                    value={customLocation}
                    onChange={handleCustomLocationChange}
                  />
                </div>
              )}
            </div>

            {/* Company Name (for merchants) */}
            {formData.role === 'MERCHANT' && (
              <div>
                <label htmlFor="companyName" className="label text-sm mb-1.5">
                  Nom de l'entreprise
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    className="input-field pl-9 text-sm py-2"
                    placeholder="Nom de votre entreprise"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="label text-sm mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="input-field pl-9 pr-9 text-sm py-2"
                  placeholder="Min. 6 caractères"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="label text-sm mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="input-field pl-9 pr-9 text-sm py-2"
                  placeholder="Confirmez le mot de passe"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-2.5 text-sm font-semibold"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Inscription...
                  </div>
                ) : (
                  'Créer mon compte'
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Déjà un compte ?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;


