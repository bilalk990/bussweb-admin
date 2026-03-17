import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Clock, X, Menu } from 'lucide-react';
import { notifications } from '../../data/mockData';
import ReactDOM from 'react-dom';

const NotificationDropdown = ({ 
  notifications, 
  onClose,
  buttonRect
}: { 
  notifications: any[], 
  onClose: () => void,
  buttonRect: DOMRect | null
}) => {
  if (!buttonRect) return null;
  
  // Calculate position
  const top = buttonRect.bottom + window.scrollY;
  const right = window.innerWidth - buttonRect.right - window.scrollX;
  
  return ReactDOM.createPortal(
    <>
      {/* Backdrop - invisible but captures clicks outside */}
      <div 
        className="fixed inset-0 bg-transparent z-[9998]"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Notification panel */}
      <div 
        className="fixed z-[9999]"
        style={{
          top: `${top}px`,
          right: `${right}px`,
          width: '320px',
          maxWidth: '95vw'
        }}
      >
        <motion.div 
          className="bg-gray-900/95 backdrop-blur-md border border-gray-800/50 rounded-lg shadow-2xl overflow-hidden mt-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between p-3 border-b border-gray-800/50">
            <h3 className="font-medium text-gray-200">Notifications</h3>
            <button 
              className="p-1 rounded-full hover:bg-gray-800/50"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <X size={14} className="text-gray-400" />
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No notifications</div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 border-b border-gray-800/30 hover:bg-gray-800/30 transition-colors ${!notification.read ? 'bg-gray-800/20' : ''}`}
                  >
                    <div className="flex items-start">
                      <div className={`w-2 h-2 mt-1.5 rounded-full mr-2 flex-shrink-0 ${
                        notification.type === 'warning' ? 'bg-warning-500' :
                        notification.type === 'error' ? 'bg-error-500' :
                        notification.type === 'success' ? 'bg-success-500' :
                        'bg-primary-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-200 truncate">{notification.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-2 border-t border-gray-800/50">
            <button className="w-full text-xs text-center text-primary-400 hover:text-primary-300 p-1">
              Mark all as read
            </button>
          </div>
        </motion.div>
      </div>
    </>,
    document.body
  );
};

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [notificationButtonRect, setNotificationButtonRect] = useState<DOMRect | null>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const toggleNotifications = () => {
    if (!showNotifications && notificationButtonRef.current) {
      setNotificationButtonRect(notificationButtonRef.current.getBoundingClientRect());
    }
    setShowNotifications(!showNotifications);
  };

  // Close notifications on escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  return (
    <header className="h-16 px-2 sm:px-4 flex items-center justify-between border-b border-gray-800/50 bg-gray-900/40 backdrop-blur-sm">
      <div className="flex items-center w-full">
        {/* Mobile Left Space */}
        <div className="lg:hidden w-10"></div>
        
        {/* Desktop Search Bar */}
        <div className="hidden md:flex relative ml-4 lg:ml-0 flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full p-2 pl-10 text-sm text-gray-300 border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="Search buses, routes, drivers..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        
        <div className="flex items-center ml-auto">
          {/* Date/Time - Hide on small screens */}
          <div className="hidden sm:flex items-center mr-4">
            <Clock size={18} className="text-gray-400 mr-2" />
            <span className="text-sm text-gray-300">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })} | {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          
          <div className="relative">
            <button 
              ref={notificationButtonRef}
              className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors relative"
              onClick={toggleNotifications}
              aria-label="Notifications"
            >
              <Bell size={18} className="text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <NotificationDropdown
                  notifications={notifications}
                  onClose={() => setShowNotifications(false)}
                  buttonRect={notificationButtonRect}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;