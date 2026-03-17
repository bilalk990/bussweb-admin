import { BASE_URL } from './config';
import { authService } from './authService';

export interface TripHistory {
  _id: string;
  driverId: string | null;
  routeName: string;
  busName: string;
  busId: string;
  stops: number;
  driverName: string;
  departureTime: string;
  origin: string;
  destination: string;
  arrivalTime: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  subCompanyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripHistoryResponse {
  message: string;
  data: TripHistory[];
}

export interface Route {
  _id: string;
  routeName: string;
  origin: string;
  destination: string;
  distance: number;
  price: number;
  status: string;
  subCompanyId: string;
  createdAt: string;
  updatedAt: string;
  waypoints: any[];
}

export interface RoutesResponse {
  message: string;
  data: Route[];
}

export interface Driver {
  _id: string;
  name: string;
  email: string;
}

export interface DriversResponse {
  message: string;
  data: Driver[];
}

export interface CreateScheduleRequest {
  routeId: string;
  driverId: string;
  departureTime: string;
  arrivalTime: string;
  departureBusStation: string;
  arrivalBusStation: string;
  stops: {
    location: string;
    arrivalTime: string;
    departureTime: string;
  }[];
}

export interface TripDetails {
  tripId: string;
  status: string;
  departureTime: string;
  arrivalTime: string;
  stops: {
    location: string;
    arrivalTime: string;
    departureTime: string;
    _id: string;
  }[];
  route: {
    name: string;
    origin: string;
    destination: string;
    distance: number;
    adultPrice: number;
    childPrice: number;
  };
  bus: {
    name: string;
    plateNumber: string;
    type: string;
    capacity: number;
  };
  driver: {
    name: string;
    phone: string;
  };
}

export interface Location {
  lat: number;
  lon: number;
  display_name: string;
}

export interface TripDetailsResponse {
  data: TripDetails;
}

export const tripHistoryService = {
 
  async getTripHistory(): Promise<TripHistoryResponse> {
    const token = authService.getToken();
    
    try {
      const response = await fetch(`${BASE_URL}/sub-company/staff/get-trip-history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch trip history');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching trip history:', error);
      throw error;
    }
  },

  async getAllRoutes(): Promise<RoutesResponse> {
    const token = authService.getToken();
    try {
      const response = await fetch(`${BASE_URL}/sub-company/staff/all-routes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch routes');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw error;
    }
  },

  async getAvailableDrivers(): Promise<DriversResponse> {
    const token = authService.getToken();
    try {
      const response = await fetch(`${BASE_URL}/sub-company/staff/available-drivers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch available drivers');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      throw error;
    }
  },

  async createSchedule(token: string, scheduleData: CreateScheduleRequest): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/sub-company/create-route-schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      const data = await response.json();

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create schedule');
      }

      return data;
    } catch (error) {
      console.error('Error in createSchedule:', error);
      throw error;
    }
  },

  async getTripDetails(tripId: string) {
    const token = authService.getToken();
    try {
      const response = await fetch(`${BASE_URL}/sub-company/staff/get-trip-details/${tripId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch trip details');
      }

      return data;
    } catch (error) {
      console.error('Error fetching trip details');
      throw error;
    }
  },

  async getLocationData(location: string): Promise<Location[]> {
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/search?key=${import.meta.env.VITE_LOCATIONIQ_API_KEY}&q=${encodeURIComponent(location)}&format=json&limit=1`
      );

      if (!response.ok) {
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.getLocationData(location);
        }
        throw new Error(`Failed to fetch location data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No location data found');
      }
      return data;
    } catch (error) {
      console.error('Error fetching location data for location:', location, error);
      return [{
        lat: 0,
        lon: 0,
        display_name: location
      }];
    }
  },

  async updateTrip(
    token: string, 
    tripId: string, 
    data: {
      departureTime: string;
      arrivalTime: string;
      driverId: string;
      stops: {
        location: string;
        arrivalTime: string;
        departureTime: string;
      }[];
    }
  ): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/sub-company/update-trip`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripId,
          ...data
        }),
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        throw new Error('Failed to update trip');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  }
}; 