import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const authToken = useSelector((state) => state.auth.authToken);
  console.log("auth token froom private route",authToken);
  
  return authToken ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
