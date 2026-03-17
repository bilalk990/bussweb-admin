import { BASE_URL } from './config';
import { authService } from './authService';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

interface CreateStaffData {
  name: string;
  email: string;
  password: string;
  role: 'Staff' | 'Sub_Admin';
}

class StaffService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${BASE_URL}/sub-company`;
  }

  async listAllStaff(): Promise<StaffMember[]> {
    const token = await authService.getToken();
    const response = await fetch(`${this.baseUrl}/list-all-staff`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch staff members');
    }

    const data = await response.json();
    return data.data;
  }

  async createStaff(data: CreateStaffData) {
    const token = authService.getToken();
    const formattedData = {
      ...data,
      role: data.role.toLowerCase().replace(' ', '_')
    };
    
    const response = await fetch(`${this.baseUrl}/create-staff`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });

    const res = await response.json();
    if (!response.ok) {
      throw new Error(res.message || 'Failed to create staff member');
    }

    return res;
  }

  async deleteStaff(staffId: string) {
    const token = authService.getToken();
    const response = await fetch(`${this.baseUrl}/delete-staff/${staffId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const res = await response.json();
    if (!response.ok) {
      throw new Error(res.message || 'Failed to delete staff member');
    }

    return res;
  }

  async blockStaff(staffId: string): Promise<void> {
    const token = await authService.getToken();
    const response = await fetch(`${this.baseUrl}/block-staff/${staffId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to block staff member');
    }
  }

  async unblockStaff(staffId: string): Promise<void> {
    const token = await authService.getToken();
    const response = await fetch(`${this.baseUrl}/unblock-staff/${staffId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to unblock staff member');
    }
  }
}

export const staffService = new StaffService(); 