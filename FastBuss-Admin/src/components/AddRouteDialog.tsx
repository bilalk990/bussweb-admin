import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Search, Loader2 } from 'lucide-react';
import { locationService, LocationSuggestion } from '../services/locationService';
import { routeService } from '../services/routeService';

interface AddRouteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteAdded: () => void;
}

interface RouteFormData {
  routeName: string;
  origin: {
    display_name: string;
    lat: number;
    lon: number;
  } | null;
  destination: {
    display_name: string;
    lat: number;
    lon: number;
  } | null;
  distance: number | null;
  adultPrice: string;
  childPrice: string;
}

export const AddRouteDialog: React.FC<AddRouteDialogProps> = ({ isOpen, onClose, onRouteAdded }) => {
  const [formData, setFormData] = useState<RouteFormData>({
    routeName: '',
    origin: null,
    destination: null,
    distance: null,
    adultPrice: '',
    childPrice: ''
  });

  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<LocationSuggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearchOrigin = async (query: string) => {
    setOriginInput(query);
    if (query.length < 3) {
      setOriginSuggestions([]);
      return;
    }
    try {
      const suggestions = await locationService.searchLocations(query);
      setOriginSuggestions(suggestions);
    } catch (error) {
      console.error('Error searching origin:', error);
    }
  };

  const handleSearchDestination = async (query: string) => {
    setDestinationInput(query);
    if (query.length < 3) {
      setDestinationSuggestions([]);
      return;
    }
    try {
      const suggestions = await locationService.searchLocations(query);
      setDestinationSuggestions(suggestions);
    } catch (error) {
      console.error('Error searching destination:', error);
    }
  };

  const calculateDistance = async () => {
    if (!formData.origin || !formData.destination) return;

    setIsCalculatingDistance(true);
    try {
      const distance = await locationService.calculateDistance(
        { lat: formData.origin.lat, lon: formData.origin.lon },
        { lat: formData.destination.lat, lon: formData.destination.lon }
      );
      setFormData(prev => ({ ...prev, distance }));
    } catch (error) {
      console.error('Error calculating distance:', error);
      setError('Failed to calculate distance. Please try again.');
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  useEffect(() => {
    if (formData.origin && formData.destination) {
      calculateDistance();
    }
  }, [formData.origin, formData.destination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await routeService.createRoute({
        routeName: formData.routeName,
        origin: formData.origin!.display_name,
        destination: formData.destination!.display_name,
        distance: formData.distance!,
        adultPrice: parseFloat(formData.adultPrice),
        childPrice: parseFloat(formData.childPrice)
      });

      onRouteAdded();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create route');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
        <Dialog.Panel className="w-full max-w-lg sm:max-w-2xl rounded-lg bg-gray-900 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Dialog.Title className="text-lg sm:text-xl font-semibold text-white">Add New Route</Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close dialog">
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2 sm:p-3 bg-red-900/50 border border-red-800 rounded-md text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Route Name</label>
              <input
                type="text"
                value={formData.routeName}
                onChange={(e) => setFormData(prev => ({ ...prev, routeName: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-1">Origin</label>
              <div className="relative">
                <input
                  type="text"
                  value={originInput}
                  onChange={(e) => handleSearchOrigin(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {originSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {originSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.place_id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          origin: {
                            display_name: suggestion.display_name,
                            lat: suggestion.lat,
                            lon: suggestion.lon
                          }
                        }));
                        setOriginInput(suggestion.display_name);
                        setOriginSuggestions([]);
                      }}
                      className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 text-sm truncate"
                    >
                      {suggestion.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-1">Destination</label>
              <div className="relative">
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => handleSearchDestination(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {destinationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {destinationSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.place_id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          destination: {
                            display_name: suggestion.display_name,
                            lat: suggestion.lat,
                            lon: suggestion.lon
                          }
                        }));
                        setDestinationInput(suggestion.display_name);
                        setDestinationSuggestions([]);
                      }}
                      className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 text-sm truncate"
                    >
                      {suggestion.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Distance (km)</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.distance || ''}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
                {isCalculatingDistance && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary-500" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Adult Price (€)</label>
              <input
                type="number"
                value={formData.adultPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, adultPrice: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Child Price (€)</label>
              <input
                type="number"
                value={formData.childPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, childPrice: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4 sm:mt-6 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3 sm:px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.distance}
                className="px-3 sm:px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </div>
                ) : (
                  'Create Route'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 