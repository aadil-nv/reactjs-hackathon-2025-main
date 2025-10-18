import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoutes';
import Signup from '../components/Signup';

// Lazy load pages
const Login = lazy(() => import('../components/Login'));
const ChatLayout = lazy(() => import('../components/ChatLayout'));

const AppRoutes = () => (
  <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <ChatLayout />
          </PrivateRoute>
        }
      />
      <Route
        path="/signup"
        element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
        }
      />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
