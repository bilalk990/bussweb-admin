import { authService } from './authService';
import { BASE_URL } from './config';

export interface Route {
  _id: string;
  routeName: string;
  origin: string;
  destination: string;
  distance: number;
  adultPrice: number;
  childPrice: number;
  status: 'active' | 'inactive' | 'modified';
  waypoints?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRouteData {
  routeName: string;
  origin: string;
  destination: string;
  distance: number;
  adultPrice: number;
  childPrice: number;
}

export interface RoutesResponse {
  message: string;
  data: Route[];
}

export interface CreateRouteResponse {
  message: string;
  data: Route;
}

export interface FetchRoutesResponse {
  data: Route[];
}

export interface UpdateRouteData {
  routeName?: string;
  origin?: string;
  destination?: string;
  distance?: number;
  adultPrice?: number;
  childPrice?: number;
  status?: 'active' | 'inactive' | 'modified';
}

export interface UpdateRouteResponse {
  message: string;
  route: Route;
}

export const routeService = {
  async fetchRoutes(): Promise<FetchRoutesResponse> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${BASE_URL}/sub-company/staff/all-routes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch routes');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw error;
    }
  },

  async createRoute(data: CreateRouteData): Promise<CreateRouteResponse> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${BASE_URL}/sub-company/create-route`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create route');
      }

      return responseData;
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  },

  async deactivateRoute(routeId: string): Promise<void> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${BASE_URL}/sub-company/deactivate-route/${routeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to deactivate route');
      }
    } catch (error) {
      console.error('Error deactivating route:', error);
      throw error;
    }
  },

  async deleteRoute(routeId: string): Promise<void> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${BASE_URL}/sub-company/delete-route/${routeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete route');
      }
    } catch (error) {
      console.error('Error deleting route:', error);
      throw error;
    }
  },

  async activateRoute(routeId: string): Promise<void> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${BASE_URL}/sub-company/activate-route/${routeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to activate route');
      }
    } catch (error) {
      console.error('Error activating route:', error);
      throw error;
    }
  },

  async updateRoute(routeId: string, data: UpdateRouteData): Promise<UpdateRouteResponse> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${BASE_URL}/sub-company/update-route/${routeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update route');
      }

      return responseData;
    } catch (error) {
      console.error('Error updating route:', error);
      throw error;
    }
  }
}; 