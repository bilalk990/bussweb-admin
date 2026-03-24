export interface IBus {
  id: number;
  name: string;
  plateNumber: string;
  capacity: number;
  type?: string;
  status: "active" | "inactive" | "maintenance" | "blocked";
  agencyId: number;
  driverId?: number | null;
  currentLocation?: any;
}
