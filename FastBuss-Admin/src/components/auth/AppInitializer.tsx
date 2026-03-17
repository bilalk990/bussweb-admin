import  { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import SplashScreen from './SplashScreen';

const AppInitializer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Skip initialization if we're already on the splash screen or login page
      if (location.pathname === '/' || location.pathname === '/login') {
        setIsInitializing(false);
        return;
      }

      try {
        const token = authService.getToken();
        if (!token) {
          navigate('/login');
          return;
        }

        // Check if token is expired using isAuthenticated
        if (!authService.isAuthenticated()) {
          authService.removeToken();
          navigate('/login');
          return;
        }

        // Validate token with server
        const isValid = await authService.validateToken();
        if (!isValid) {
          authService.removeToken();
          navigate('/login');
        }
      } catch (error) {
        authService.removeToken();
        navigate('/login');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [navigate, location]);

  if (isInitializing) {
    return <SplashScreen />;
  }

  return null;
};

export default AppInitializer; 