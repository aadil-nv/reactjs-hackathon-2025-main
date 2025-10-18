import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = ({ children }) => {
  const authToken = useSelector((state) => state.auth.authToken);
  return !authToken ? children : <Navigate to="/chat" replace />;
};

export default PublicRoute;
