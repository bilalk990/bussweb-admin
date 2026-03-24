export interface IUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'user' | 'sub_admin' | 'super_admin' | 'staff' | 'driver';
  profilePicture?: string | null;
  status: "active" | "inactive" | "banned" | "blocked";
  agencyId?: number | null;
  is_email_verified: boolean;
  assignedBusId?: number | null;
}
