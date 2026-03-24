export interface ISubCompany {
  id: number;
  companyName: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  createdBy?: number;
  isActive: boolean;
}
