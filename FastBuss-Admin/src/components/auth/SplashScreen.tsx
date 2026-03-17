import  { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const SplashScreen = () => {
  const navigate = useNavigate();
  // const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAndRedirect = async () => {
      try {
        const isValid = await authService.validateToken();
        if (isValid) {
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      } catch (error) {
        navigate('/login');
      }
    };

    // Add a minimum display time for the splash screen
    const timer = setTimeout(() => {
      validateAndRedirect();
    }, 2000); // Show splash for at least 2 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-dark-blue flex items-center justify-center z-[9999] backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="w-24 h-24 mx-auto relative">
            <motion.div
              className="absolute inset-0 bg-primary-500 rounded-lg"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 bg-dark-blue rounded-lg flex items-center justify-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="text-4xl font-bold text-white">FB</span>
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-4xl font-bold text-white mb-2"
        >
          FastBuss Admin
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-gray-400"
        >
          Fleet Management System
        </motion.p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, delay: 0.8 }}
          className="h-1 bg-primary-500 mt-8 rounded-full"
        />
      </motion.div>
    </div>
  );
};

export default SplashScreen; 