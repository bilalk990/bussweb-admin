import { BASE_URL } from './config';
import { authService } from './authService';

export interface Driver {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture: string;
  assignedBus: string | null;
  subCompanyId: string;
  role: string;
  status: string;
  is_email_verified: boolean;
  one_signal_id: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface DriversResponse {
  data: Driver[];
}

export interface TripHistory {
  _id: string;
  busName: string;
  busPlateNumber: string;
  distance: number;
  price: number;
  routeName: string;
  origin: string;
  destination: string;
}

export interface TripHistoryResponse {
  message: string;
  data: TripHistory[];
}

export const driverService = {
  getDrivers: async (): Promise<DriversResponse> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${BASE_URL}/sub-company/staff/drivers`, {
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
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.message) {
          throw new Error(errorData.message);
        } else {
          throw new Error('Failed to fetch drivers');
        }
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching drivers: ${error.message}`);
      }
      throw error;
    }
  },

  // Generate a random avatar URL for drivers without profile pictures
  generateRandomAvatar: (name: string): string => {
    // Using DiceBear API for generating avatars
    const seed = name.replace(/\s+/g, '').toLowerCase();
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  },

  banDriver: async (driverId: string): Promise<void> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${BASE_URL}/sub-company/ban-driver/${driverId}`, {
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
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.message) {
          throw new Error(errorData.message);
        } else {
          throw new Error('Failed to ban driver');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error banning driver: ${error.message}`);
      }
      throw error;
    }
  },

  unbanDriver: async (driverId: string): Promise<void> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${BASE_URL}/sub-company/unban-driver/${driverId}`, {
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
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.message) {
          throw new Error(errorData.message);
        } else {
          throw new Error('Failed to unban driver');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error unbanning driver: ${error.message}`);
      }
      throw error;
    }
  },

  deleteDriver: async (driverId: string): Promise<void> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${BASE_URL}/sub-company/delete-driver/${driverId}`, {
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
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.message) {
          throw new Error(errorData.message);
        } else {
          throw new Error('Failed to delete driver');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error deleting driver: ${error.message}`);
      }
      throw error;
    }
  },

  assignBus: async (driverId: string, busId: string): Promise<void> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${BASE_URL}/sub-company/assign-driver-to-bus`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ driverId, busId }),
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.message) {
          throw new Error(errorData.message);
        } else {
          throw new Error('Failed to assign bus to driver');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error assigning bus to driver: ${error.message}`);
      }
      throw error;
    }
  },

  unassignBus: async (driverId: string): Promise<void> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${BASE_URL}/sub-company/unassign-driver-from-bus`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId }),
      });

      if (authService.handleTokenExpiration(response)) {
        throw new Error('Token expired');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.message) {
          throw new Error(errorData.message);
        } else {
          throw new Error('Failed to unassign bus from driver');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error unassigning bus from driver: ${error.message}`);
      }
      throw error;
    }
  },

  createDriver: async (data: { name: string; email: string; phone: string; password: string }): Promise<void> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${BASE_URL}/sub-company/create-driver`, {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.message) {
          throw new Error(errorData.message);
        } else {
          throw new Error('Failed to create driver');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error creating driver: ${error.message}`);
      }
      throw error;
    }
  },

  getTripHistory: async (driverId: string): Promise<TripHistoryResponse> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${BASE_URL}/sub-company/staff/get-trip-history-by-driver/${driverId}`, {
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
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.message) {
          throw new Error(errorData.message);
        } else {
          throw new Error('Failed to fetch trip history');
        }
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching trip history: ${error.message}`);
      }
      throw error;
    }
  },
};

