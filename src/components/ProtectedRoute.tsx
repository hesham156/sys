import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;