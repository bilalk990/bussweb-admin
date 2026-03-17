import { Company, CompanyFormData } from '../types/company';
import { BASE_URL } from './config';
import { authService } from './authService';

class CompanyService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${BASE_URL}/sub-company`;
    }

    async listCompanies(): Promise<Company[]> {
        const token = await authService.getToken();
        const response = await fetch(`${this.baseUrl}/list-sub-companies`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch companies');
        }
        const data = await response.json();
        return data.data;
    }

    async getCompany(id: string): Promise<Company> {
        const token = await authService.getToken();
        const response = await fetch(`${this.baseUrl}/view-sub-company-details/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch company');
        }
        const data = await response.json();
        return data.data;
    }

    async createCompany(formData: FormData): Promise<Company> {
        const token = await authService.getToken();
        const response = await fetch(`${this.baseUrl}/create-sub-company`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to create company');
        }
        const data = await response.json();
        return data.data;
    }

    async updateCompany(id: string, companyData: Partial<CompanyFormData>): Promise<Company> {
        const token = await authService.getToken();
        const response = await fetch(`${this.baseUrl}/update-sub-company/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(companyData),
        });
        if (!response.ok) {
            throw new Error('Failed to update company');
        }
        const data = await response.json();
        return data.data;
    }

    async deleteCompany(id: string): Promise<void> {
        const token =  authService.getToken();
        const response = await fetch(`${this.baseUrl}/delete-sub-company/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to delete company');
        }
    }

    async suspendCompany(id: string): Promise<Company> {
        const token = await authService.getToken();
        const response = await fetch(`${this.baseUrl}/suspend-sub-company/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to suspend company');
        }
        const data = await response.json();
        return data.data;
    }

    async activateCompany(id: string): Promise<Company> {
        const token = await authService.getToken();
        const response = await fetch(`${this.baseUrl}/activate-sub-company/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to activate company');
        }
        const data = await response.json();
        return data.data;
    }
}

export const companyService = new CompanyService(); 