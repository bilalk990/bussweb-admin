import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Route as RouteIcon, MapPin, Clock, Users, Plus, Search, Filter, Loader2, Check, X, Trash2, Edit } from 'lucide-react';
import { routeService, Route } from '../services/routeService';
import { AddRouteDialog } from '../components/AddRouteDialog';
import { EditRouteDialog } from '../components/EditRouteDialog';

const RoutesManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [loadingActions, setLoadingActions] = useState<Record<string, 'activate' | 'deactivate' | 'delete' | null>>({});

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await routeService.fetchRoutes();
        setRoutes(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch routes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleActivateRoute = async (routeId: string) => {
    try {
      setLoadingActions(prev => ({ ...prev, [routeId]: 'activate' }));
      await routeService.activateRoute(routeId);
      
      // Update the route status in the local state
      setRoutes(prev => prev.map(route => 
        route._id === routeId 
          ? { ...route, status: 'active' as const }
          : route
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate route');
    } finally {
      setLoadingActions(prev => ({ ...prev, [routeId]: null }));
    }
  };

  const handleDeactivateRoute = async (routeId: string) => {
    try {
      setLoadingActions(prev => ({ ...prev, [routeId]: 'deactivate' }));
      await routeService.deactivateRoute(routeId);
      
      // Update the route status in the local state
      setRoutes(prev => prev.map(route => 
        route._id === routeId 
          ? { ...route, status: 'inactive' as const }
          : route
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate route');
    } finally {
      setLoadingActions(prev => ({ ...prev, [routeId]: null }));
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!window.confirm('Are you sure you want to delete this route?')) {
      return;
    }

    try {
      setLoadingActions(prev => ({ ...prev, [routeId]: 'delete' }));
      await routeService.deleteRoute(routeId);
      
      // Remove the route from the local state
      setRoutes(prev => prev.filter(route => route._id !== routeId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete route');
    } finally {
      setLoadingActions(prev => ({ ...prev, [routeId]: null }));
    }
  };

  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setIsEditDialogOpen(true);
  };

  const handleRouteAdded = () => {
    // Refresh the routes list
    const fetchRoutes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await routeService.fetchRoutes();
        setRoutes(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch routes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  };

  const handleRouteUpdated = () => {
    const fetchRoutes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await routeService.fetchRoutes();
        setRoutes(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch routes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  };

  // Calculate route statistics
  const totalRoutes = routes.length;
  const activeRoutes = routes.filter(route => route.status === 'active').length;
  const totalStops = routes.reduce((sum, route) => sum + (route.waypoints?.length || 0), 0);
  const avgPassengers = Math.round(
    routes.reduce((sum, route) => sum + (route.price || 0), 0) / (routes.length || 1)
  );

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         route.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         route.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 px-2 sm:px-0"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Routes Management</h1>
        <button 
          onClick={() => setIsAddDialogOpen(true)}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus size={16} />
          Add New Route
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary-900/60 rounded-md">
              <RouteIcon size={18} className="text-primary-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Total Routes</p>
              <p className="text-lg sm:text-xl font-semibold text-white">{totalRoutes}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-success-900/60 rounded-md">
              <RouteIcon size={18} className="text-success-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Active Routes</p>
              <p className="text-lg sm:text-xl font-semibold text-white">{activeRoutes}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-secondary-900/60 rounded-md">
              <MapPin size={18} className="text-secondary-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Total Stops</p>
              <p className="text-lg sm:text-xl font-semibold text-white">{totalStops}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-accent-900/60 rounded-md">
              <Users size={18} className="text-accent-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Avg. Price</p>
              <p className="text-lg sm:text-xl font-semibold text-white">€ {avgPassengers.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-900/50 border border-gray-800 rounded-md text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="modified">Modified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Routes List */}
      <div className="glass-card">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            {error}
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredRoutes.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  No routes found. Try adjusting your search or create a new route.
                </div>
              ) : (
                filteredRoutes.map((route) => (
                  <div key={route._id} className="bg-gray-900/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{route.routeName}</h3>
                        <div className="text-sm text-gray-400 min-w-0">
                          <div className="flex items-start gap-1 min-w-0">
                            <span className="text-gray-500 min-w-[40px] shrink-0">From:</span>
                            <span className="truncate flex-1 min-w-0" title={route.origin}>{route.origin}</span>
                          </div>
                          <div className="flex items-start gap-1 min-w-0">
                            <span className="text-gray-500 min-w-[40px] shrink-0">To:</span>
                            <span className="truncate flex-1 min-w-0" title={route.destination}>{route.destination}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        route.status === 'active' ? 'bg-success-900/60 text-success-400' :
                        route.status === 'inactive' ? 'bg-gray-900/60 text-gray-400' :
                        'bg-warning-900/60 text-warning-400'
                      }`}>
                        {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                      <div className="text-sm text-gray-400">
                        <span className="text-gray-500">Dist:</span> {route.distance} km
                        <span className="mx-2">•</span>
                        <span className="text-gray-500">Adult:</span> € {route.adultPrice.toLocaleString()}
                        <span className="mx-2">•</span>
                        <span className="text-gray-500">Child:</span> € {route.childPrice.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        {route.status === 'active' ? (
                          <button 
                            onClick={() => handleDeactivateRoute(route._id)}
                            disabled={loadingActions[route._id] === 'deactivate'}
                            className="p-1.5 hover:bg-gray-800 rounded-md group relative disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Deactivate"
                            aria-label="Deactivate route"
                          >
                            {loadingActions[route._id] === 'deactivate' ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : (
                              <X size={16} className="text-red-400" />
                            )}
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleActivateRoute(route._id)}
                            disabled={loadingActions[route._id] === 'activate'}
                            className="p-1.5 hover:bg-gray-800 rounded-md group relative disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Activate"
                            aria-label="Activate route"
                          >
                            {loadingActions[route._id] === 'activate' ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : (
                              <Check size={16} className="text-success-400" />
                            )}
                          </button>
                        )}
                        <button 
                          onClick={() => handleEditRoute(route)}
                          className="p-1.5 hover:bg-gray-800 rounded-md group relative"
                          title="Edit"
                          aria-label="Edit route"
                        >
                          <Edit size={16} className="text-blue-400" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRoute(route._id)}
                          disabled={loadingActions[route._id] === 'delete'}
                          className="p-1.5 hover:bg-gray-800 rounded-md group relative disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                          aria-label="Delete route"
                        >
                          {loadingActions[route._id] === 'delete' ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <Trash2 size={16} className="text-red-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto -mx-4 sm:-mx-2 md:mx-0 shadow-md rounded-lg">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full">
                  <thead className="bg-gray-900/60">
                    <tr className="border-b border-gray-800">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Route Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Origin</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Destination</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Distance</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Adult Price</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Child Price</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredRoutes.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                          No routes found. Try adjusting your search or create a new route.
                        </td>
                      </tr>
                    ) : (
                      filteredRoutes.map((route) => (
                        <tr key={route._id} className="hover:bg-gray-900/50">
                          <td className="px-4 py-3 text-white">
                            <span className="font-medium">{route.routeName}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            <div className="max-w-[150px] truncate overflow-hidden" title={route.origin}>
                              {route.origin}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            <div className="max-w-[150px] truncate overflow-hidden" title={route.destination}>
                              {route.destination}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400">{route.distance} km</td>
                          <td className="px-4 py-3 text-gray-400 whitespace-nowrap">€ {route.adultPrice.toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-400 whitespace-nowrap">€ {route.childPrice.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              route.status === 'active' ? 'bg-success-900/60 text-success-400' :
                              route.status === 'inactive' ? 'bg-gray-900/60 text-gray-400' :
                              'bg-warning-900/60 text-warning-400'
                            }`}>
                              {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {route.status === 'active' ? (
                                <button 
                                  onClick={() => handleDeactivateRoute(route._id)}
                                  disabled={loadingActions[route._id] === 'deactivate'}
                                  className="p-1.5 hover:bg-gray-800 rounded-md group relative disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Deactivate"
                                  aria-label="Deactivate route"
                                >
                                  {loadingActions[route._id] === 'deactivate' ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                  ) : (
                                    <X size={16} className="text-red-400" />
                                  )}
                                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    Deactivate
                                  </span>
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleActivateRoute(route._id)}
                                  disabled={loadingActions[route._id] === 'activate'}
                                  className="p-1.5 hover:bg-gray-800 rounded-md group relative disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Activate"
                                  aria-label="Activate route"
                                >
                                  {loadingActions[route._id] === 'activate' ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                  ) : (
                                    <Check size={16} className="text-success-400" />
                                  )}
                                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    Activate
                                  </span>
                                </button>
                              )}
                              <button 
                                onClick={() => handleEditRoute(route)}
                                className="p-1.5 hover:bg-gray-800 rounded-md group relative"
                                title="Edit"
                                aria-label="Edit route"
                              >
                                <Edit size={16} className="text-blue-400" />
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  Edit
                                </span>
                              </button>
                              <button 
                                onClick={() => handleDeleteRoute(route._id)}
                                disabled={loadingActions[route._id] === 'delete'}
                                className="p-1.5 hover:bg-gray-800 rounded-md group relative disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete"
                                aria-label="Delete route"
                              >
                                {loadingActions[route._id] === 'delete' ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                ) : (
                                  <Trash2 size={16} className="text-red-400" />
                                )}
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  Delete
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <AddRouteDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onRouteAdded={handleRouteAdded}
      />

      {selectedRoute && (
        <EditRouteDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedRoute(null);
          }}
          onRouteUpdated={handleRouteUpdated}
          route={selectedRoute}
        />
      )}
    </motion.div>
  );
};

export default RoutesManagement; 