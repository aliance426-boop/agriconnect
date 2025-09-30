import React from 'react';
import { User } from 'lucide-react';

const UserAvatar = ({ 
  user, 
  size = 'md', 
  showName = false, 
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'md':
        return 'w-12 h-12';
      case 'lg':
        return 'w-16 h-16';
      case 'xl':
        return 'w-24 h-24';
      default:
        return 'w-12 h-12';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  };

  const getInitials = () => {
    if (!user) return '?';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const getImageUrl = () => {
    if (user?.profileImage) {
      return `http://localhost:5000/uploads/${user.profileImage}`;
    }
    return null;
  };

  const getDefaultAvatar = () => {
    if (!user) return '/images/default-avatars/producer-default.svg';
    
    switch (user.role) {
      case 'PRODUCER':
        return '/images/default-avatars/producer-default.svg';
      case 'MERCHANT':
        return '/images/default-avatars/merchant-default.svg';
      default:
        return '/images/default-avatars/producer-default.svg';
    }
  };

  const avatarContent = () => {
    const imageUrl = getImageUrl();
    
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={`${user?.firstName} ${user?.lastName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Si l'image ne charge pas, afficher les initiales
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    
    return (
      <img
        src={getDefaultAvatar()}
        alt={`Avatar par défaut ${user?.role === 'PRODUCER' ? 'Producteur' : 'Commerçant'}`}
        className="w-full h-full object-cover"
      />
    );
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${getSizeClasses()} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
        {avatarContent()}
        {/* Fallback avec avatar par défaut (caché par défaut) */}
        <img
          src={getDefaultAvatar()}
          alt={`Avatar par défaut ${user?.role === 'PRODUCER' ? 'Producteur' : 'Commerçant'}`}
          className="w-full h-full object-cover"
          style={{ display: 'none' }}
        />
      </div>
      
      {showName && user && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.firstName} {user.lastName}
          </p>
          {user.companyName && (
            <p className="text-xs text-gray-500 truncate">
              {user.companyName}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
