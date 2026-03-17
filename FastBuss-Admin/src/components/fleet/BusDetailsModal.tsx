import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bus, MapPin, Users, Calendar, Clock, Phone, Mail, User, Settings, Loader2 } from 'lucide-react';
import { Bus as BusType, busService, BusDetailsResponse } from '../../services/busService';
import ShimmerEffect from '../common/ShimmerEffect';

interface BusDetailsModalProps {
  bus: BusType;
  onClose: () => void;
  onStatusChange: (action: 'activate' | 'block' | 'delete' | 'maintenance' | 'backFromMaintenance') => void;
  isLoading: boolean;
}

const BusDetailsModal: React.FC<BusDetailsModalProps> = ({ bus, onClose, onStatusChange }) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [busDetails, setBusDetails] = useState<BusDetailsResponse['data'] | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        setIsLoadingDetails(true);
        setError(null);
        const response = await busService.fetchBusDetails(bus._id);
        setBusDetails(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bus details');
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchBusDetails();
  }, [bus._id]);

  const handleAction = async (action: 'activate' | 'block' | 'delete' | 'maintenance' | 'backFromMaintenance') => {
    setLoadingAction(action);
    try {
      await onStatusChange(action);
    } finally {
      setLoadingAction(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success-500';
      case 'blocked':
        return 'text-error-500';
      case 'inactive':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'In Service';
      case 'blocked':
        return 'Blocked';
      case 'inactive':
        return 'Not in Service';
      default:
        return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
    >
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-dark-blue rounded-lg p-3 sm:p-6 w-full max-w-2xl mx-3 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary-900/60 rounded-md">
              <Bus size={18} className="text-primary-400 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-white">{bus.busName}</h2>
              <div className="flex items-center">
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 sm:mr-1.5 ${getStatusColor(bus.status)}`}></span>
                <span className="text-xs sm:text-sm text-gray-400">{getStatusText(bus.status)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-500/20 text-red-400 rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}

        {isLoadingDetails ? (
          <div className="space-y-4 sm:space-y-8">
            {/* Basic Information Shimmer */}
            <div className="glass-card p-3 sm:p-4 rounded-lg">
              <ShimmerEffect className="h-4 sm:h-6 w-32 sm:w-48 mb-3 sm:mb-4" />
              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-4">
                    <ShimmerEffect className="h-3 sm:h-4 w-24 sm:w-32" />
                    <ShimmerEffect className="h-3 sm:h-4 w-32 sm:w-48" />
                  </div>
                ))}
              </div>
            </div>

            {/* Location Information Shimmer */}
            <div className="glass-card p-3 sm:p-4 rounded-lg">
              <ShimmerEffect className="h-4 sm:h-6 w-32 sm:w-48 mb-3 sm:mb-4" />
              <div className="space-y-2 sm:space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-4">
                    <ShimmerEffect className="h-3 sm:h-4 w-24 sm:w-32" />
                    <ShimmerEffect className="h-3 sm:h-4 w-32 sm:w-48" />
                  </div>
                ))}
              </div>
            </div>

            {/* Driver Information Shimmer */}
            <div className="glass-card p-3 sm:p-4 rounded-lg">
              <ShimmerEffect className="h-4 sm:h-6 w-32 sm:w-48 mb-3 sm:mb-4" />
              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-4">
                    <ShimmerEffect className="h-3 sm:h-4 w-24 sm:w-32" />
                    <ShimmerEffect className="h-3 sm:h-4 w-32 sm:w-48" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-8">
            {/* Basic Information */}
            <div className="glass-card p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
                <Users size={16} className="mr-1.5 sm:mr-2 text-primary-400 sm:w-[18px] sm:h-[18px]" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="text-gray-400 w-24 sm:w-32">Bus Number:</span>
                  <span className="text-white font-medium">{busDetails?.plateNumber}</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="text-gray-400 w-24 sm:w-32">Type:</span>
                  <span className="text-white font-medium capitalize">{busDetails?.type}</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="text-gray-400 w-24 sm:w-32">Capacity:</span>
                  <span className="text-white font-medium">{busDetails?.capacity} passengers</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="text-gray-400 w-24 sm:w-32">Status:</span>
                  <span className={`font-medium ${getStatusColor(busDetails?.status || '')}`}>
                    {getStatusText(busDetails?.status || '')}
                  </span>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="glass-card p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
                <MapPin size={16} className="mr-1.5 sm:mr-2 text-primary-400 sm:w-[18px] sm:h-[18px]" />
                Location Information
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {busDetails?.location?.latitude && busDetails?.location?.longitude ? (
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="text-gray-400 w-24 sm:w-32">Current Location:</span>
                    <span className="text-white font-medium">
                      {busDetails.location.address || `${busDetails.location.latitude}, ${busDetails.location.longitude}`}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-gray-400">No location data available</div>
                )}
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="text-gray-400 w-24 sm:w-32">Last Updated:</span>
                  <span className="text-white font-medium">
                    {busDetails?.location?.timestamp ? new Date(busDetails.location.timestamp).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            {busDetails?.driver && (
              <div className="glass-card p-3 sm:p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
                  <User size={16} className="mr-1.5 sm:mr-2 text-primary-400 sm:w-[18px] sm:h-[18px]" />
                  Driver Information
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="text-gray-400 w-24 sm:w-32">Name:</span>
                    <span className="text-white font-medium">{busDetails.driver.name}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="text-gray-400 w-24 sm:w-32">Email:</span>
                    <span className="text-white font-medium">{busDetails.driver.email}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="text-gray-400 w-24 sm:w-32">Phone:</span>
                    <span className="text-white font-medium">{busDetails.driver.phone}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="text-gray-400 w-24 sm:w-32">Status:</span>
                    <span className={`font-medium ${
                      busDetails.driver.status === 'active' ? 'text-success-500' : 'text-gray-500'
                    }`}>
                      {busDetails.driver.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Status Management */}
            <div className="glass-card p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
                <Settings size={16} className="mr-1.5 sm:mr-2 text-primary-400 sm:w-[18px] sm:h-[18px]" />
                Bus Management
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {/* Show Activate button when status is blocked */}
                {bus.status === 'blocked' && (
                  <button
                    onClick={() => handleAction('activate')}
                    disabled={loadingAction !== null}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-success-600 hover:bg-success-700 text-white rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center gap-1 sm:gap-2"
                  >
                    {loadingAction === 'activate' ? (
                      <><Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> Activating...</>
                    ) : (
                      'Activate Bus'
                    )}
                  </button>
                )}
                
                {/* Show Deactivate button when status is active or inactive */}
                {(bus.status === 'active' || bus.status === 'inactive') && (
                  <button
                    onClick={() => handleAction('block')}
                    disabled={loadingAction !== null}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-warning-600 hover:bg-warning-700 text-white rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center gap-1 sm:gap-2"
                  >
                    {loadingAction === 'block' ? (
                      <><Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> Deactivating...</>
                    ) : (
                      'Deactivate Bus'
                    )}
                  </button>
                )}

                {/* Show Maintenance button for all statuses except maintenance */}
                {bus.status !== 'maintenance' && (
                  <button
                    onClick={() => handleAction('maintenance')}
                    disabled={loadingAction !== null}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center gap-1 sm:gap-2"
                  >
                    {loadingAction === 'maintenance' ? (
                      <><Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> Updating...</>
                    ) : (
                      'Send to Maintenance'
                    )}
                  </button>
                )}

                {/* Show Back from Maintenance button when status is maintenance */}
                {bus.status === 'maintenance' && (
                  <button
                    onClick={() => handleAction('backFromMaintenance')}
                    disabled={loadingAction !== null}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center gap-1 sm:gap-2"
                  >
                    {loadingAction === 'backFromMaintenance' ? (
                      <><Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> Updating...</>
                    ) : (
                      'Back from Maintenance'
                    )}
                  </button>
                )}
                
                {/* Delete button is always available */}
                <button
                  onClick={() => handleAction('delete')}
                  disabled={loadingAction !== null}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-error-600 hover:bg-error-700 text-white rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center gap-1 sm:gap-2"
                >
                  {loadingAction === 'delete' ? (
                    <><Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> Deleting...</>
                  ) : (
                    'Delete Bus'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BusDetailsModal; 