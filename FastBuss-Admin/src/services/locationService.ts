import axios from 'axios';

const API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
const BASE_URL = import.meta.env.VITE_LOCATIONIQ_BASE_URL;

export interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: number;
  lon: number;
}

export interface DistanceResponse {
  code: string;
  routes: Array<{
    distance: number;
    duration: number;
    geometry: string;
  }>;
}

export const locationService = {
  searchLocations: async (query: string): Promise<LocationSuggestion[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/autocomplete`, {
        params: {
          key: API_KEY,
          q: query,
          limit: 5,
          dedupe: 1
        }
      });
      return response.data.map((item: any) => ({
        place_id: item.place_id,
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      }));
    } catch (error) {
      console.error('Error searching locations:', error);
      throw error;
    }
  },

  calculateDistance: async (origin: { lat: number; lon: number }, destination: { lat: number; lon: number }): Promise<number> => {
    try {
      const response = await axios.get(`${BASE_URL}/directions/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}`, {
        params: {
          key: API_KEY,
          geometries: 'geojson',
          overview: 'full'
        }
      });
      
      const distance = response.data.routes[0].distance / 1000; // Convert meters to kilometers
      return Math.round(distance * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Error calculating distance:', error);
      throw error;
    }
  }
};