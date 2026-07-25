import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAccess } from 'hooks/useAdminAccess';
import AccessDenied from './AccessDenied';

const RouteAccessGuard = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, hasAccessToPath, defaultPath } = useAdminAccess();

  if (!isAuthenticated) {
    return <Navigate to="/pages/login/login3" replace state={{ from: location }} />;
  }

  if (!hasAccessToPath(location.pathname)) {
    if (location.pathname.toLowerCase() === defaultPath.toLowerCase()) {
      return <AccessDenied />;
    }
    return <Navigate to={defaultPath} replace />;
  }

  return children;
};

export default RouteAccessGuard;
