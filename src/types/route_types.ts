export interface IRoute {
    id: number;
    routeName: string;
    origin: string;
    destination: string;
    distance?: number;
    childPrice: number;
    adultPrice: number;
    status: "active" | "inactive";
    subCompanyId: number;
    waypoints: { latitude: number; longitude: number }[];
    createdAt: Date;
    updatedAt: Date;
}
