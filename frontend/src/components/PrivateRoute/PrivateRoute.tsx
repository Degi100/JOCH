// ============================================
// JOCH Bandpage - Private Route Component
// Protects routes that require authentication and specific roles
// ============================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactElement;
  requiredRoles?: ('admin' | 'member' | 'user')[];
}

/**
 * PrivateRoute Component
 * Redirects to login if user is not authenticated
 * Optionally checks if user has required role(s)
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredRoles = []
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show nothing while checking auth status
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: '#f0f0f0',
        fontFamily: 'system-ui, sans-serif'
      }}>
        Laden...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      // Redirect to home if user doesn't have required role
      return <Navigate to="/" replace />;
    }
  }

  // Render protected content
  return children;
};

export default PrivateRoute;