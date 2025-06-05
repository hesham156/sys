import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import AuthProvider from './contexts/AuthContext';
import NotificationProvider from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SalesView from './pages/SalesView';
import DesignView from './pages/DesignView';
import ManagerView from './pages/ManagerView';
import ProductionView from './pages/ProductionView';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50 font-inter">
            <Toaster position="top-right" />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/sales" element={<ProtectedRoute allowedRoles={['sales', 'admin']}><SalesView /></ProtectedRoute>} />
              <Route path="/design" element={<ProtectedRoute allowedRoles={['design', 'admin']}><DesignView /></ProtectedRoute>} />
              <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><ManagerView /></ProtectedRoute>} />
              <Route path="/production" element={<ProtectedRoute allowedRoles={['production', 'admin']}><ProductionView /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;