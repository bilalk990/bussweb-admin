import { Request, Response } from "express";
import { Op } from "sequelize";
import Bus from "../models/bus_model";
import User from "../models/user_model";
import Route from "../models/route_model";
import Trip from "../models/trip_model";
import { ITrip } from "../types/trip_types";
import { IRoute } from "../types/route_types";
import { IBus } from "../types/bus_types";
import { IUser } from "../types/user_types";

export const dashboardController = {

    // ==================== DASHBOARD OVERVIEW ====================
    dashboardOverview: async (req: Request, res: Response) => {
        try {
            const user = res.locals.user;
            const subCompanyId = user.agencyId; // Using agencyId for consistency with other models

            // Get current date for filtering
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Total active buses
            const totalActiveBuses = await Bus.count({
                where: {
                    agencyId: subCompanyId,
                    status: 'active'
                }
            });

            // Total active drivers
            const totalActiveDrivers = await User.count({
                where: {
                    agencyId: subCompanyId,
                    role: 'driver',
                    status: 'active'
                }
            });

            // Total active routes
            const totalActiveRoutes = await Route.count({
                where: {
                    agencyId: subCompanyId,
                    status: 'active'
                }
            });

            // Total scheduled trips for today
            const totalScheduledTrips = await Trip.count({
                where: {
                    agencyId: subCompanyId,
                    departureDate: today.toISOString().split('T')[0],
                    status: 'scheduled'
                }
            });

            // Total completed trips for today
            const totalCompletedTrips = await Trip.count({
                where: {
                    agencyId: subCompanyId,
                    departureDate: today.toISOString().split('T')[0],
                    status: 'completed'
                }
            });

            // TODO: Implement actual revenue calculation after Paysera integration
            const dummyRevenueToday = 1000;
            const dummyRevenueMonth = 15600;

            res.status(200).json({
                data: {
                    totalActiveBuses,
                    totalActiveDrivers,
                    totalActiveRoutes,
                    totalScheduledTrips,
                    totalCompletedTrips,
                    revenueToday: dummyRevenueToday,
                    revenueMonth: dummyRevenueMonth
                }
            });
        } catch (error) {
            console.error("getDashboardData error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    recentActivities: async (req: Request, res: Response) => {
        try {
            const user = res.locals.user;
            const subCompanyId = user.agencyId;

            if (!subCompanyId) {
                return res.status(400).json({ error: "Subcompany ID is required" });
            }

            // Get recent completed trips
            const recentTrips = await Trip.findAll({
                where: {
                    agencyId: subCompanyId,
                    status: 'completed'
                },
                order: [['updatedAt', 'DESC']],
                limit: 5,
                attributes: ['id', 'routeId', 'busId', 'departureTime', 'arrivalTime']
            });

            const mappedTrips = await Promise.all(recentTrips.map(async trip => {
                const [route, bus] = await Promise.all([
                    Route.findByPk(trip.routeId),
                    Bus.findByPk(trip.busId)
                ]);

                let driverName = "N/A";
                if (bus && bus.driverId) {
                    const driver = await User.findByPk(bus.driverId);
                    driverName = driver?.name || "N/A";
                }

                return {
                    route: route ? `${route.origin} - ${route.destination}` : "N/A",
                    bus: bus?.plateNumber || "N/A",
                    driver: driverName,
                    departureTime: trip.departureTime,
                    arrivalTime: trip.arrivalTime
                };
            }));

            // Get maintenance alerts
            const maintenanceAlerts = await Bus.findAll({
                where: {
                    agencyId: subCompanyId,
                    status: 'maintenance',
                },
                order: [['updatedAt', 'DESC']],
                limit: 5,
                attributes: ['plateNumber', 'name', 'status']
            });

            // Get recent driver assignments (pending trips)
            const driverAssignments = await Trip.findAll({
                where: {
                    agencyId: subCompanyId,
                    status: 'scheduled' // using scheduled instead of pending as per ENUM
                },
                order: [['createdAt', 'DESC']],
                limit: 5,
                attributes: ['routeId', 'busId', 'departureTime']
            });

            const mappedAssignments = await Promise.all(driverAssignments.map(async trip => {
                const [route, bus] = await Promise.all([
                    Route.findByPk(trip.routeId),
                    Bus.findByPk(trip.busId)
                ]);

                let driverName = "N/A";
                if (bus && bus.driverId) {
                    const driver = await User.findByPk(bus.driverId);
                    driverName = driver?.name || "N/A";
                }

                return {
                    route: route ? `${route.origin} - ${route.destination}` : "N/A",
                    bus: bus?.plateNumber || "N/A",
                    driver: driverName,
                    departureTime: trip.departureTime
                };
            }));

            // Get recent route changes
            const routeChanges = await Route.findAll({
                where: {
                    agencyId: subCompanyId,
                    updatedAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
                },
                order: [['updatedAt', 'DESC']],
                limit: 5,
                attributes: ['origin', 'destination', 'status', 'updatedAt']
            });

            // Get recent schedule updates
            const scheduleUpdates = await Trip.findAll({
                where: {
                    agencyId: subCompanyId,
                    updatedAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
                },
                order: [['updatedAt', 'DESC']],
                limit: 5,
                attributes: ['routeId', 'departureTime', 'arrivalTime', 'updatedAt']
            });

            const mappedScheduleUpdates = await Promise.all(scheduleUpdates.map(async update => {
                const route = await Route.findByPk(update.routeId);
                return {
                    route: route ? `${route.origin} - ${route.destination}` : "N/A",
                    departureTime: update.departureTime,
                    arrivalTime: update.arrivalTime,
                    updatedAt: update.updatedAt
                };
            }));

            res.status(200).json({
                data: {
                    recentTrips: mappedTrips,
                    maintenanceAlerts: maintenanceAlerts.map(bus => ({
                        bus: bus.plateNumber,
                        status: bus.status
                    })),
                    driverAssignments: mappedAssignments,
                    routeChanges: routeChanges.map(route => ({
                        route: `${route.origin} - ${route.destination}`,
                        status: route.status,
                        updatedAt: route.updatedAt,
                    })),
                    scheduleUpdates: mappedScheduleUpdates
                }
            });
        } catch (error) {
            console.error("getRecentActivities error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    upcomingSchedule: async (req: Request, res: Response) => {
        try {
            const user = res.locals.user;
            const subCompanyId = user.agencyId;

            if (!subCompanyId) {
                return res.status(400).json({ error: "Subcompany ID is required" });
            }

            // Get today's date range
            const todayStr = new Date().toISOString().split('T')[0];

            // Get today's upcoming trips
            const upcomingTrips = await Trip.findAll({
                where: {
                    agencyId: subCompanyId,
                    status: 'scheduled',
                    departureDate: todayStr
                },
                order: [['departureTime', 'ASC']],
                attributes: ['id', 'routeId', 'busId', 'departureTime', 'arrivalTime', 'status']
            });

            const mappedTrips = await Promise.all(upcomingTrips.map(async trip => {
                const [route, bus] = await Promise.all([
                    Route.findByPk(trip.routeId),
                    Bus.findByPk(trip.busId)
                ]);

                let driverInfo = { name: "N/A", phone: "N/A" };
                if (bus && bus.driverId) {
                    const driver = await User.findByPk(bus.driverId);
                    if (driver) {
                        driverInfo = { name: driver.name, phone: driver.phone || "N/A" };
                    }
                }

                return {
                    tripId: trip.id,
                    route: route ? {
                        from: route.origin,
                        to: route.destination,
                        distance: route.distance
                    } : null,
                    bus: bus ? {
                        plateNumber: bus.plateNumber,
                        name: bus.name,
                        capacity: bus.capacity,
                        type: bus.busType
                    } : null,
                    driver: driverInfo,
                    schedule: {
                        departureTime: trip.departureTime,
                        arrivalTime: trip.arrivalTime,
                        status: trip.status
                    }
                };
            }));

            res.status(200).json({
                data: mappedTrips
            });
        } catch (error) {
            console.error("getUpcomingSchedule error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
};
