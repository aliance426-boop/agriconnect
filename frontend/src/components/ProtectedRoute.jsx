import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Rediriger vers le bon dashboard selon le rôle
    if (user?.role === 'PRODUCER') {
      return <Navigate to="/dashboard" replace />;
    } else if (user?.role === 'MERCHANT') {
      return <Navigate to="/merchant" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;


