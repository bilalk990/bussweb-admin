import { BASE_URL } from './config';

export interface LoginResponse {
  message: string;
  token?: string;
}

export interface LoginError {
  message: string;
  status: number;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  profilePicture: string | null;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || 'Login failed',
          status: response.status,
        };
      }

      // Save token if login is successful
      if (data.token) {
        authService.setToken(data.token);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw {
          message: error.message,
          status: 500,
        };
      }
      throw error;
    }
  },

  // Token management
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  removeToken: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: (): boolean => {
    const token = authService.getToken();
    if (!token) return false;

    try {
      // Decode token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1])) as TokenPayload;
      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },

  getTokenPayload: (): TokenPayload | null => {
    const token = authService.getToken();
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1])) as TokenPayload;
    } catch {
      return null;
    }
  },

  logout: () => {
    authService.removeToken();
    // You can add additional cleanup here if needed
  },

  validateToken: async (): Promise<boolean> => {
    const token = authService.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${BASE_URL}/auth/check-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 410) {
        authService.removeToken();
        window.location.href = '/login';
        return false;
      }

      return response.ok;
    } catch {
      return false;
    }
  },

  handleTokenExpiration: (response: Response) => {
    if (response.status === 410) {
      authService.removeToken();
      window.location.href = '/login';
      return true;
    }
    return false;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const token = authService.getToken();
    const response = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldPassword,
        newPassword
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }
  },

  async getUserProfile(): Promise<UserProfile> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${BASE_URL}/sub-company/staff/get-admin-details`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return data.data;
  }
}; 