export interface Company {
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
  staffCount: number;
  busCount: number;
  driverCount: number;
}

export interface CompanyFormData {
  companyName?: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
} 