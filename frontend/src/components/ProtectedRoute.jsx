import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export function ProtectedRoute({ children, requiredRole = null, redirectTo = "/" }) {
  const { user, loading, isLoggedIn } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-smart-darkblue">
        <div className="text-white text-xl font-heading">
          🔄 Checking authentication...
        </div>
      </div>
    );
  }

  // If not logged in, redirect to home with current location for redirect after login
  if (!isLoggedIn || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If a specific role is required, check user role
  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on user's actual role
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/landing" replace />;
    }
  }

  // User is authenticated and has required role
  return children;
}

export function AdminRoute({ children }) {
  return (
    <ProtectedRoute requiredRole="ADMIN" redirectTo="/">
      {children}
    </ProtectedRoute>
  );
}

export function UserRoute({ children }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}