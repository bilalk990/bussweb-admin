export interface ITrip {
  id: number;
  _id: string; // compatibility
  routeId: number;
  busId: number;
  agencyId: number;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  status: "scheduled" | "delayed" | "cancelled" | "completed" | "ongoing";
  departureBusStation?: string;
  arrivalBusStation?: string;
  createdAt: Date;
  updatedAt: Date;
}
