import { BASE_URL } from './config';
import { authService } from './authService';

interface CompanyProfile {
    _id: string;
    companyName: string;
    logo: string;
    contactEmail: string;
    contactPhone: string;
    description: string;
    createdBy: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}


class CompanyProfileService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${BASE_URL}/sub-company`;
    }

    async getCompanyProfile(): Promise<CompanyProfile> {
        const token = authService.getToken();
        const response = await fetch(`${this.baseUrl}/staff/company-profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch company profile');
        }
        const data = await response.json();
        return data.subCompany;
    }

    async updateCompanyProfile(formData: FormData): Promise<CompanyProfile> {
        const token = authService.getToken();
        const response = await fetch(`${this.baseUrl}/update-company-profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error('Failed to update company profile');
        }
        return data.subCompany;
    }
}

export const companyProfileService = new CompanyProfileService(); 