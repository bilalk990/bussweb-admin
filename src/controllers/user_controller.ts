import { Request, Response } from "express";
import User from "../models/user_model";
import bcrypt from "bcryptjs";
import Trip from "../models/trip_model";
import { Route } from "../models/route_model";
import Booking from "../models/booking_model";
import Bus from "../models/bus_model";
import { Op } from "sequelize";

export const userController = {
    // ==================== USER PROFILE ====================

    getStatus: async (req: Request, res: Response) => {
        try {
            const userId = res.locals.userId;
            const user = await User.findByPk(userId, {
                attributes: ["id", "status", "email", "emailVerifiedAt", "role"]
            });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const userData = user.get({ plain: true }) as any;
            userData._id = userData.id;

            res.status(200).json({
                message: "User status fetched successfully",
                data: userData,
            });
        } catch (error) {
            console.error("getStatus error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getProfile: async (req: Request, res: Response) => {
        try {
            const userId = res.locals.userId;
            const user = await User.findByPk(userId, {
                attributes: { exclude: ["password"] }
            });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const userData = user.get({ plain: true }) as any;
            userData._id = userData.id;

            res.status(200).json({
                message: "Profile fetched successfully",
                data: userData
            });
        } catch (error) {
            console.error("getProfile error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    updateProfile: async (req: Request, res: Response) => {
        try {
            const userId = res.locals.userId;
            const { name, email } = req.body;

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!name && !email) {
                res.status(400).json({ message: "You Either Change Your Email or Name" });
                return;
            }

            if (name) user.name = name;
            if (email) {
                const existEmail = await User.findOne({ where: { email } });
                if (existEmail) {
                    res.status(400).json({ message: "Email Already Exist" });
                    return;
                }
                user.email = email;
            }

            await user.save();
            res.status(200).json({
                message: "Profile updated successfully",
                data: user
            });
        } catch (error) {
            console.error("updateProfile error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // ==================== USER ACCOUNT ====================
    deleteAccount: async (req: Request, res: Response) => {
        try {
            const userId = res.locals.userId;
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({ message: "Password is required" });
            }

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Password is incorrect" });
            }

            await Booking.destroy({ where: { userId: userId } });
            await User.destroy({ where: { id: userId } });

            res.status(200).json({ message: "Account deleted successfully" });
        } catch (error) {
            console.error("deleteAccount error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getBookedTrips: async (req: Request, res: Response) => {
        try {
            const userId = res.locals.userId;
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const bookings = await Booking.findAll({
                where: {
                    userId: userId,
                    status: { [Op.in]: ["pending", "confirmed"] }
                }
            });

            res.status(200).json({ message: "Booked trips fetched successfully", data: bookings });
        } catch (error) {
            console.error("getBookedTrips error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getAvailableTrips: async (req: Request, res: Response) => {
        try {
            const { departureDate, destination, origin } = req.query;
            if (!departureDate || !destination || !origin) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const parsedDate = new Date(departureDate as string);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({ message: "Invalid departure date" });
            }

            const matchedRoutes = await Route.findAll({
                where: {
                    origin: { [Op.like]: `%${origin}%` },
                    destination: { [Op.like]: `%${destination}%` },
                }
            });

            if (!matchedRoutes.length) {
                return res.status(404).json({ message: "No matching route found" });
            }

            const routeIds = matchedRoutes.map(r => r.id);
            const dateStr = parsedDate.toISOString().split('T')[0];

            const trips = await Trip.findAll({
                where: {
                    routeId: { [Op.in]: routeIds },
                    departureDate: dateStr,
                    status: "scheduled"
                }
            });

            const response = await Promise.all(trips.map(async trip => {
                const route = matchedRoutes.find(r => r.id === trip.routeId);
                const bus = await Bus.findByPk(trip.busId);
                return {
                    id: trip.id,
                    route: route ? {
                        origin: route.origin,
                        destination: route.destination,
                        distance: route.distance,
                        adultPrice: route.adultPrice,
                        childPrice: route.childPrice,
                    } : null,
                    departureTime: trip.departureTime,
                    arrivalTime: trip.arrivalTime,
                    status: trip.status,
                    bus: bus ? {
                        busNumber: bus.plateNumber,
                        busType: bus.type,
                        busName: bus.name,
                        capacity: bus.capacity,
                    } : null,
                };
            }));

            res.status(200).json({ message: "Available trips fetched successfully", data: response });
        } catch (error) {
            console.error("getAvailableTrips error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getAllTripHistory: async (req: Request, res: Response) => {
        try {
            const userId = res.locals.userId;
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const bookings = await Booking.findAll({ where: { userId: user.id } });

            res.status(200).json({ message: "Trip history fetched successfully", data: bookings });
        } catch (error) {
            console.error("getAllTripHistory error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // ==================== DRIVER ====================
    getMyCurrentAssignedTrip: async (req: Request, res: Response) => {
        try {
            const user = res.locals.user;
            const bus = await Bus.findOne({ where: { driverId: user.id } });
            if (!bus) {
                return res.status(400).json({ message: "No bus assigned" });
            }

            const trip = await Trip.findOne({
                where: {
                    busId: bus.id,
                    status: { [Op.in]: ["scheduled", "delayed"] }
                }
            });

            if (!trip) {
                res.status(400).json({ message: "No active trip" });
                return;
            }

            const route = await Route.findByPk(trip.routeId);

            const response = {
                id: trip.id,
                route: route ? {
                    origin: route.origin,
                    destination: route.destination,
                    routeName: route.routeName,
                } : null,
                departureTime: trip.departureTime,
                arrivalTime: trip.arrivalTime,
                status: trip.status,
            };

            res.status(200).json({ message: "Active trip found", data: response });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    startTrip: async (req: Request, res: Response) => {
        try {
            const { tripId } = req.body;
            if (!tripId) return res.status(400).json({ message: "Trip ID is required" });

            const user = res.locals.user;
            const bus = await Bus.findOne({ where: { driverId: user.id } });
            if (!bus) return res.status(400).json({ message: "No bus assigned to driver" });

            const trip = await Trip.findOne({ where: { id: tripId, busId: bus.id } });
            if (!trip) return res.status(404).json({ message: "Trip not found" });

            if (trip.status !== "scheduled") {
                return res.status(400).json({
                    message: `Cannot start trip. Current status is: ${trip.status}`
                });
            }

            await trip.update({ status: "delayed" }); // using delayed as "ongoing" equivalent

            res.status(200).json({
                message: "Trip started successfully",
                data: { tripId: trip.id, status: trip.status }
            });
        } catch (error) {
            console.error("startTrip error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

    endTrip: async (req: Request, res: Response) => {
        try {
            const { tripId } = req.body;
            if (!tripId) return res.status(400).json({ message: "Trip ID is required" });

            const user = res.locals.user;
            const bus = await Bus.findOne({ where: { driverId: user.id } });
            if (!bus) return res.status(400).json({ message: "No bus assigned to driver" });

            const trip = await Trip.findOne({ where: { id: tripId, busId: bus.id } });
            if (!trip) return res.status(404).json({ message: "Trip not found" });

            if (trip.status !== "delayed") {
                return res.status(400).json({
                    message: `Cannot end trip. Current status is: ${trip.status}`
                });
            }

            await Trip.update({ status: "completed" }, { where: { id: tripId } });
            await User.update({ status: "inactive" }, { where: { id: user.id } });
            await Bus.update({ status: "inactive" }, { where: { id: bus.id } });

            res.status(200).json({
                message: "Trip ended successfully",
                data: { tripId: trip.id, status: "completed" }
            });
        } catch (error) {
            console.error("endTrip error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

    driverTripHistory: async (req: Request, res: Response) => {
        try {
            const user = res.locals.user;
            const bus = await Bus.findOne({ where: { driverId: user.id } });
            if (!bus) return res.status(404).json({ message: "No bus assigned" });

            const trips = await Trip.findAll({ where: { busId: bus.id } });

            const response = await Promise.all(trips.map(async trip => {
                const route = await Route.findByPk(trip.routeId);
                return {
                    id: trip.id,
                    origin: route?.origin || "N/A",
                    destination: route?.destination || "N/A",
                    status: trip.status,
                    departureDate: trip.departureDate,
                    departureTime: trip.departureTime,
                    arrivalTime: trip.arrivalTime,
                };
            }));

            res.status(200).json({ message: "All Trips", data: response });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

    bookTrip: async (req: Request, res: Response) => {
        res.status(501).json({ message: "Not implemented" });
    },

    cancelTrip: async (req: Request, res: Response) => {
        res.status(501).json({ message: "Not implemented" });
    },

    resendTicket: async (req: Request, res: Response) => {
        res.status(501).json({ message: "Not implemented" });
    }
};
