import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, X, Bus as BusIcon, Loader2 } from 'lucide-react';
import { Bus } from '../services/busService';
import BusStatusCard from '../components/dashboard/BusStatusCard';
import AddBusForm from '../components/fleet/AddBusForm';
import BusDetailsModal from '../components/fleet/BusDetailsModal';
import { busService, CreateBusData } from '../services/busService';

const FleetManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setIsLoading(true);
        const response = await busService.fetchBuses();
        setBuses(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch buses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuses();
  }, []);

  const filteredBuses = buses.filter((bus: Bus) => {
    if (!bus) return false;
    const matchesSearch = (bus.busName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (bus.busNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bus.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddBus = async (busData: CreateBusData) => {
    try {
      setIsLoading(true);
      setError(null);
      await busService.createBus(busData);
      // Refresh the bus list after adding a new bus
      const response = await busService.fetchBuses();
      setBuses(response.data);
      setIsAddModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add bus');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusClick = (bus: Bus) => {
    setSelectedBus(bus);
  };

  const handleStatusChange = async (action: 'activate' | 'block' | 'delete' | 'maintenance' | 'backFromMaintenance') => {
    if (!selectedBus) return;

    try {
      setIsLoading(true);
      setError(null);

      switch (action) {
        case 'activate':
          break;
        case 'block':
          break;
        case 'maintenance':
          break;
        case 'backFromMaintenance':
          break;
        case 'delete':
          await busService.deleteBus(selectedBus._id);
          // Remove the bus from the list
          setBuses(buses.filter(bus => bus._id !== selectedBus._id));
          setSelectedBus(null);
          return;
        default:
          throw new Error('Invalid action');
      }

      // Update the bus in the list and refresh the bus list
      const response = await busService.fetchBuses();
      setBuses(response.data);
      setSelectedBus(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bus status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="px-1 sm:px-0"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Fleet Management</h1>
          <p className="text-sm text-gray-400 mt-0.5 sm:mt-1">Manage and monitor your bus fleet</p>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-sm sm:text-base text-white rounded-lg hover:bg-blue-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? <span>Loading...</span> : <><Plus size={16} className="sm:w-[18px] sm:h-[18px]" /><span>Add New Bus</span></>}
        </button>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400 sm:w-[18px] sm:h-[18px]" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 border border-gray-700 rounded-lg bg-gray-800/50 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Search by bus number or route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <button 
              className={`p-1.5 sm:p-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? <span>Loading...</span> : <Filter size={18} className="sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {[
          { label: 'Total Buses', value: buses.length, color: 'primary' },
          { label: 'Active', value: buses.filter((b: Bus) => b.status === 'active').length, color: 'success' },
          { label: 'Inactive', value: buses.filter((b: Bus) => b.status === 'inactive').length, color: 'error' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="data-card p-3 sm:p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">{stat.label}</p>
                <p className={`text-lg sm:text-2xl font-semibold text-${stat.color}-400 mt-0.5 sm:mt-1`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg bg-${stat.color}-900/20`}>
                <BusIcon size={20} className={`text-${stat.color}-400 sm:w-6 sm:h-6`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bus Grid */}
      <div className="glass-card p-3 sm:p-4">
        {isLoading ? (
          <div className="flex flex-col sm:flex-row justify-center items-center py-8 sm:py-12 space-y-2 sm:space-y-0 sm:space-x-3">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary-500" />
            <span className="text-sm sm:text-base text-gray-400">Loading buses...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 text-center">
            <div className="p-2 sm:p-3 rounded-full bg-error-900/20 mb-3 sm:mb-4">
              <X size={20} className="text-error-500 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-1 sm:mb-2">Failed to load buses</h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="col-span-full text-center py-8 sm:py-12">
            <BusIcon size={36} className="mx-auto text-gray-600 mb-3 sm:mb-4 sm:w-12 sm:h-12" />
            <h3 className="text-base sm:text-lg font-medium text-gray-400">No buses found</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredBuses.map((bus: Bus, index: number) => (
              <motion.div
                key={bus._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <BusStatusCard bus={bus} onClick={handleBusClick} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Bus Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-0"
          >
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setError(null);
              }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-dark-blue rounded-lg p-4 sm:p-6 w-full max-w-md mx-3 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white">Add New Bus</h2>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
              {error && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <AddBusForm 
                onSubmit={handleAddBus} 
                onCancel={() => {
                  setIsAddModalOpen(false);
                  setError(null);
                }}
                isLoading={isLoading}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bus Details Modal */}
      <AnimatePresence>
        {selectedBus && (
          <BusDetailsModal
            bus={selectedBus}
            onClose={() => setSelectedBus(null)}
            onStatusChange={handleStatusChange}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FleetManagement;