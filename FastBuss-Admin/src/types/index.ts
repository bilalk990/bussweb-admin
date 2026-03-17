export interface Bus {
  _id: string;
  busName: string;
  busNumber: string;
  busType: string;
  capacity: number;
  status: 'active' | 'inactive';
  subCompanyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  status: 'available' | 'on-duty' | 'off-duty';
  phone: string;
  email: string;
  licenseExpiry: string;
  rating: number;
  totalTrips: number;
}

export interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  distance: number;
  duration: number;
  stops: number;
  avgPassengers: number;
  status: 'active' | 'inactive' | 'modified';
}

export interface ScheduleItem {
  id: string;
  busId: string;
  busNumber: string;
  driverId: string;
  driverName: string;
  routeId: string;
  routeName: string;
  departureTime: string;
  arrivalTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
}

export interface AnalyticsData {
  passengersByDay: {
    day: string;
    count: number;
  }[];
  busUtilization: {
    busId: string;
    busNumber: string;
    percentage: number;
  }[];
  routePerformance: {
    routeId: string;
    routeName: string;
    efficiency: number;
    punctuality: number;
    satisfaction: number;
  }[];
  fuelConsumption: {
    month: string;
    amount: number;
  }[];
}