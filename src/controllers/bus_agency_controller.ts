import Bus from "../models/bus_model";
import { Request, Response } from "express";
import User from "../models/user_model";
import bcrypt from "bcryptjs";
import { uploadToCloudinary } from "../middlewares/upload_middleware";
import Route from "../models/route_model";
import BusAgency from "../models/bus_agency_model"
import { sendEmail } from "../services/email_service";
import sendPushNotification from "../config/onesignal";
import Trip from "../models/trip_model";
import { Op } from "sequelize";
import { StaffOperation } from "../models/staff_operation_model";
import { seatController } from "./seat_controller";
import Booking from "../models/booking_model";
import BusPoint from "../models/bus_point_model";
import BusFare from "../models/bus_fare_model";
import RouteStop from "../models/route_stop_model";

export const busAgencyController = {

    // ==================== STAFF MANAGEMENT ====================
    createStaff: async (req: Request, res: Response) => {
        try {
            const { name, email, password, role } = req.body;
            const subCompanyId = res.locals.user.agencyId; // Use agencyId instead of subCompanyId

            if (!name || !email || !password || !role) {
                res.status(400).json({ message: "All fields are required" });
                return;
            }

            const validRoles = ["staff", "sub_admin"];
            if (!validRoles.includes(role.toLowerCase())) {
                res.status(400).json({ message: "Invalid role" });
                return;
            }

            const user = await User.findOne({ where: { email } });
            if (user) {
                res.status(400).json({ message: "User with this email already exists" });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await User.create({
                name,
                email,
                password: hashedPassword,
                role: role,
                agencyId: subCompanyId,
                status: "active",
                emailVerifiedAt: new Date(),
            });

            res.status(201).json({ message: "Staff admin created successfully" });
        } catch (error) {
            console.error("Error creating sub admin:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    listAllStaff: async (req: Request, res: Response) => {
        try {
            const subCompanyId = res.locals.user.agencyId;
            const staff = await User.findAll({
                where: { role: "staff", agencyId: subCompanyId },
                attributes: ["id", "name", "status", "role", "email"]
            });
            res.status(200).json({ message: "All staff fetched successfully", data: staff });
        } catch (error) {
            console.error("Error listing all staff:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    updateStaff: async (req: Request, res: Response) => {
        try {
            const { staffId } = req.params;
            const { name, email, password } = req.body;
            const subCompanyId = res.locals.user.agencyId;

            if (!name && !email && !password) {
                res.status(400).json({ message: "No changes to update" });
                return;
            }

            if (!staffId) {
                res.status(400).json({ message: "Staff ID is required" });
                return;
            }

            const staff = await User.findOne({ where: { id: staffId, role: "staff", agencyId: subCompanyId } });
            if (!staff) {
                res.status(404).json({ message: "Staff not found" });
                return;
            }

            const updates: any = {};
            if (name) updates.name = name;
            if (email) updates.email = email;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                updates.password = hashedPassword;
            }

            await staff.update(updates);

            res.status(200).json({ message: "Staff updated successfully" });
        } catch (error) {
            console.error("Error updating staff:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    deleteStaff: async (req: Request, res: Response) => {
        try {
            const { staffId } = req.params;
            const subCompanyId = res.locals.user.agencyId;

            if (!staffId) {
                res.status(400).json({ message: "Staff ID is required" });
                return;
            }

            const deletedCount = await User.destroy({ where: { id: staffId, role: "staff", agencyId: subCompanyId } });
            if (deletedCount === 0) {
                res.status(404).json({ message: "Staff not found" });
                return;
            }

            res.status(200).json({ message: "Staff deleted successfully" });
        } catch (error) {
            console.error("Error deleting staff:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    blockStaff: async (req: Request, res: Response) => {
        try {
            const { staffId } = req.params;
            const subCompanyId = res.locals.user.agencyId;

            if (!staffId) {
                res.status(400).json({ message: "Staff ID is required" });
                return;
            }

            const staff = await User.findOne({ where: { id: staffId, role: "staff", agencyId: subCompanyId } });
            if (!staff) {
                res.status(404).json({ message: "Staff not found" });
                return;
            }

            await staff.update({ status: "blocked" });

            res.status(200).json({ message: "Staff blocked successfully" });
        } catch (error) {
            console.error("Error blocking staff:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    unblockStaff: async (req: Request, res: Response) => {
        try {
            const { staffId } = req.params;
            const subCompanyId = res.locals.user.agencyId;

            if (!staffId) {
                res.status(400).json({ message: "Staff ID is required" });
                return;
            }

            const staff = await User.findOne({ where: { id: staffId, role: "staff", agencyId: subCompanyId } });
            if (!staff) {
                res.status(404).json({ message: "Staff not found" });
                return;
            }

            await staff.update({ status: "active" });

            res.status(200).json({ message: "Staff unblocked successfully" });

        } catch (error) {
            console.error("Error unblocking staff:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    staffDetails: async (req: Request, res: Response) => {
        try {
            const { staffId } = req.params;
            const subCompanyId = res.locals.user.agencyId;

            if (!staffId) {
                res.status(400).json({ message: "Staff ID is required" });
                return;
            }

            const staff = await User.findOne({
                where: { id: staffId, agencyId: subCompanyId },
                attributes: { exclude: ["password"] }
            });
            if (!staff) {
                res.status(404).json({ message: "Staff not found" });
                return;
            }

            res.status(200).json({ message: "Staff details fetched successfully", staff });
        } catch (error) {
            console.error("❌ Error fetching staff details:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    staffAnalysis: async (req: Request, res: Response) => {
        const { staffId } = req.params;
        if (!staffId) {
            res.status(400).json({ message: "Staff ID is required" });
            return;
        }
        const subCompanyId = res.locals.user.agencyId;

        try {
            const [staff, operations] = await Promise.all([
                User.findOne({
                    where: { id: staffId, agencyId: subCompanyId },
                    attributes: { exclude: ["password"] }
                }),
                StaffOperation.findAll({ where: { staffId: staffId, agencyId: subCompanyId } })
            ]);

            if (!staff) {
                res.status(404).json({ message: "Staff not found" });
                return;
            }

            const summary = {
                totalOperations: operations.length,
                operationsByType: {
                    create: 0,
                    update: 0,
                    delete: 0,
                    block: 0,
                    unblock: 0
                },
                recentChanges: operations
                    .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
                    .slice(0, 10) // last 10 actions
                    .map((op: any) => ({
                        date: op.timestamp,
                        operationType: op.operationType,
                        targetUserId: op.targetUserId,
                        changes: op.changes
                    }))
            };

            operations.forEach((op: any) => {
                summary.operationsByType[op.operationType as keyof typeof summary.operationsByType]++;
            });

            res.status(200).json({ message: "Staff activity summary fetched successfully", data: { staff, summary } });
        } catch (error) {
            console.error('Error fetching staff activity summary:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },


    // ==================== COMPANY PROFILE MANAGEMENT ====================
    updateCompanyProfile: async (req: Request, res: Response) => {
        try {
            const { agencyName, contactEmail, contactPhone, description } = req.body;
            const subCompanyId = res.locals.user.agencyId;

            if (!agencyName && !contactEmail && !contactPhone && !description && !req.file) {
                res.status(400).json({ message: "No changes to update" });
                return;
            }

            const subCompany = await BusAgency.findByPk(subCompanyId);
            if (!subCompany) {
                res.status(404).json({ message: "Agency not found" });
                return;
            }

            const updates: any = {};
            if (req.file) {
                const result = await uploadToCloudinary(req.file, "logo") as { secure_url?: string, url?: string };
                if (!result) {
                    res.status(400).json({ message: "Failed to upload logo" });
                    return;
                }
                updates.logo = result.secure_url ?? result.url!;
            }

            if (agencyName) updates.agencyName = agencyName;
            if (contactEmail) updates.contactEmail = contactEmail;
            if (contactPhone) updates.contactPhone = contactPhone;
            if (description) updates.description = description;

            Object.assign(subCompany, updates);
            await subCompany.save();

            res.status(200).json({ message: "Agency profile updated successfully", subCompany });

        } catch (error) {
            console.error("Error updating company profile:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getCompanyProfile: async (req: Request, res: Response) => {
        try {
            const subCompanyId = res.locals.user.agencyId;
            const subCompany = await BusAgency.findByPk(subCompanyId);
            if (!subCompany) {
                res.status(404).json({ message: "Agency not found" });
                return;
            }
            // Map to consistent shape for frontend
            const profile = {
                id: subCompany.id,
                agencyName: subCompany.agencyName || '',
                logo: subCompany.logo || '',
                contactEmail: subCompany.contactEmail || '',
                contactPhone: subCompany.contactPhone || '',
                description: subCompany.description || '',
                isActive: !!subCompany.isActive,
            };
            res.status(200).json({ message: "Agency profile fetched successfully", subCompany: profile });
        } catch (error) {
            console.error("Error fetching company profile:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },


    // ==================== BUS MANAGEMENT ====================
    createBus: async (req: Request, res: Response) => {
        try {
            const { name, plateNumber, capacity, type } = req.body;
            const subCompanyId = res.locals.user.agencyId;

            if (!name || !plateNumber || !capacity || !type) {
                res.status(400).json({ message: "All fields are required." });
                return;
            }

            if (!subCompanyId) {
                res.status(400).json({ message: "No agency ID found for this user." });
                return;
            }

            const existingBus = await Bus.findOne({
                where: { plateNumber }
            });
            if (existingBus) {
                return res.status(409).json({ message: "Bus with this plate number already exists." });
            }

            const bus = await Bus.create({
                name,
                plateNumber,
                capacity: Number(capacity),
                busType: type,
                agencyId: subCompanyId,
                status: "inactive",
            });

            res.status(201).json({ message: "Bus created successfully", bus });
        } catch (error) {
            console.error("Create bus error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    },

    getMyBuses: async (_req: Request, res: Response) => {
        try {
            const subCompanyId = res.locals.user.agencyId;

            if (!subCompanyId) {
                res.status(200).json({ data: [] });
                return;
            }

            const buses = await Bus.findAll({
                where: { agencyId: subCompanyId }
            });
            const mappedBuses = buses.map(bus => {
                const busData = bus.toJSON() as any;
                return {
                    ...busData,
                    _id: String(bus.id),
                    name: bus.name,
                    busName: bus.name,
                    busNumber: bus.plateNumber,
                    plateNumber: bus.plateNumber,
                    type: bus.busType || 'standard',
                    busType: bus.busType || 'standard',
                    lastActive: busData.updated_at || busData.created_at || new Date().toISOString()
                };
            });
            res.status(200).json({ data: mappedBuses });
        } catch (error) {
            console.error("Fetch buses error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    },

    deactivateBus: async (req: Request, res: Response) => {
        try {
            const { busId } = req.params;
            if (!busId) {
                res.status(400).json({ message: "Bus ID is required" });
                return;
            }
            const subCompanyId = res.locals.user.agencyId;

            const bus = await Bus.findOne({ where: { id: busId, agencyId: subCompanyId } });
            if (!bus) return res.status(404).json({ message: "Bus not found" });

            await bus.update({ status: "blocked" });

            res.status(200).json({ message: "Bus deactivated successfully" });
        } catch (error) {
            console.error("Error deactivating bus:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    activateBus: async (req: Request, res: Response) => {
        try {
            const { busId } = req.params;
            const subCompanyId = res.locals.user.agencyId;

            const bus = await Bus.findOne({ where: { id: busId, agencyId: subCompanyId } });
            if (!bus) return res.status(404).json({ message: "Bus not found" });

            await bus.update({ status: "active" });

            res.status(200).json({ message: "Bus activated successfully" });
        } catch (error) {
            console.error("Error activating bus:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    busMaintenance: async (req: Request, res: Response) => {
        try {
            const { busId } = req.params;
            if (!busId) {
                res.status(400).json({ message: "Bus ID is required" });
                return;
            }
            const subCompanyId = res.locals.user.agencyId;

            const bus = await Bus.findOne({ where: { id: busId, agencyId: subCompanyId } });
            if (!bus) return res.status(404).json({ message: "Bus not found" });

            await bus.update({ status: "maintenance" });

            res.status(200).json({ message: "Bus put in maintenance successfully" });
        } catch (error) {
            console.error("Error maintenance bus:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    busBackFromMaintenance: async (req: Request, res: Response) => {
        try {
            const { busId } = req.params;
            if (!busId) {
                res.status(400).json({ message: "Bus ID is required" });
                return;
            }
            const subCompanyId = res.locals.user.agencyId;

            const bus = await Bus.findOne({ where: { id: busId, agencyId: subCompanyId } });
            if (!bus) return res.status(404).json({ message: "Bus not found" });

            await bus.update({ status: "active" });

            res.status(200).json({ message: "Bus back from maintenance successfully" });

        } catch (error) {
            console.error("Error back from maintenance bus:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getAvailableBuses: async (req: Request, res: Response) => {
        try {
            const subCompanyId = res.locals.user.agencyId;

            const buses = await Bus.findAll({
                where: {
                    agencyId: subCompanyId,
                    driverId: { [Op.ne]: null },
                    status: "active" // Changed from inactive to active as it makes more sense
                }
            });

            const mappedBuses = buses.map(bus => ({
                ...bus.toJSON(),
                _id: bus.id,
                busName: bus.name,
                busNumber: bus.plateNumber
            }));

            res.status(200).json({ message: "Available buses fetched", data: mappedBuses });
        } catch (error) {
            console.error("Error fetching available buses:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getAllDriversWithNoBus: async (req: Request, res: Response) => {
        try {
            const subCompanyId = res.locals.user.agencyId;

            const drivers = await User.findAll({
                where: {
                    agencyId: subCompanyId,
                    role: "driver",
                    assignedBusId: null
                },
                attributes: ["id", "name", "email", "phone"]
            });

            res.status(200).json({ message: "Drivers with no bus fetched", data: drivers });
        } catch (error) {
            console.error("getAllDriversWithNoBus error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getAllActiveTrips: async (req: Request, res: Response) => {
        try {
            const subCompanyId = res.locals.user.agencyId;

            const trips = await Trip.findAll({
                where: {
                    agencyId: subCompanyId,
                    status: "scheduled"
                }
            });

            res.status(200).json({ message: "All active trips fetched", data: trips });

        } catch (error) {
            console.error("Error fetching all active trips:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    deleteBus: async (req: Request, res: Response) => {
        try {
            const { busId } = req.params;
            if (!busId) {
                res.status(400).json({ message: "Bus ID is required" });
                return;
            }
            const subCompanyId = res.locals.user.agencyId;

            const deletedCount = await Bus.destroy({ where: { id: busId, agencyId: subCompanyId } });
            if (deletedCount === 0) return res.status(404).json({ message: "Bus not found" });

            res.status(200).json({ message: "Bus deleted successfully" });

        } catch (error) {
            console.error("Error deleting bus:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    noDriverBuses: async (req: Request, res: Response) => {
        try {
            const subCompanyId = res.locals.user.agencyId;
            if (!subCompanyId) {
                res.status(400).json({ message: "agencyId is required" });
                return;
            }

            const buses = await Bus.findAll({ where: { agencyId: subCompanyId, driverId: null } });
            const mappedBuses = buses.map(bus => ({
                ...bus.toJSON(),
                _id: String(bus.id),
                name: bus.name,
                busName: bus.name,
                busNumber: bus.plateNumber,
                plateNumber: bus.plateNumber,
                type: bus.busType || 'standard',
                busType: bus.busType || 'standard',
                capacity: bus.capacity,
            }));
            res.status(200).json({ message: "No driver buses fetched", data: mappedBuses });
        } catch (error) {
            console.error("Error fetching no driver buses:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    busDetails: async (req: Request, res: Response) => {
        try {
            const { busId } = req.params;
            if (!busId) {
                res.status(400).json({ message: "Bus ID is required" });
                return;
            }
            const subCompanyId = res.locals.user.agencyId;

            const bus = await Bus.findOne({ where: { id: busId, agencyId: subCompanyId } });
            if (!bus) return res.status(404).json({ message: "Bus not found" });

            const driver = bus.driverId ? await User.findOne({ where: { id: bus.driverId, agencyId: subCompanyId } }) : null;

            const response = {
                _id: bus.id,
                name: bus.name,
                plateNumber: bus.plateNumber,
                capacity: bus.capacity,
                type: bus.busType,
                status: bus.status,
                lastActive: (bus as any).updatedAt || (bus as any).createdAt || new Date().toISOString(),
                driver: driver ? {
                    _id: driver.id,
                    name: driver.name,
                    email: driver.email,
                    phone: driver.phone,
                    status: driver.status,
                } : null
            };

            res.status(200).json({ message: "Bus details fetched successfully", data: response });
        } catch (error) {
            console.error("Error fetching bus details:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },


    createDriver: async (req: Request, res: Response) => {
        try {
            const { name, email, phone, password } = req.body;
            const subCompanyId = res.locals.user.agencyId;

            if (!name || !email || !phone || !password) {
                res.status(400).json({ message: "All fields are required." });
                return;
            }


            const existingDriver = await User.findOne({ where: { email } });
            if (existingDriver) {
                res.status(409).json({ message: "User with this email already exists." });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await User.create({
                name,
                email,
                phone,
                password: hashedPassword,
                role: "driver",
                agencyId: subCompanyId,
                status: "active",
                emailVerifiedAt: new Date(),
            });

            res.status(201).json({ message: "Driver created successfully" });
        } catch (error) {
            console.error("createDriver error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getMyDrivers: async (req: Request, res: Response) => {
        try {
            const subCompanyId = res.locals.user.agencyId;

            if (!subCompanyId) {
                res.status(400).json({ message: "agencyId is required" });
                return;
            }

            const drivers = await User.findAll({
                where: { role: "driver", agencyId: subCompanyId },
                attributes: { exclude: ["password"] }
            });
            const mappedDrivers = drivers.map(driver => ({
                ...driver.toJSON(),
                _id: driver.id
            }));
            res.status(200).json({ data: mappedDrivers });
        } catch (error) {
            console.error("getMyDrivers error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    updateDriver: async (req: Request, res: Response) => {
        try {
            const driverId = req.params.driverId;

            if (!driverId) {
                res.status(400).json({ message: "Driver ID is required." });
                return;
            }

            const { name, phone, email } = req.body;
            const subCompanyId = res.locals.user.agencyId;

            const driver = await User.findOne({ where: { id: driverId, role: "driver", agencyId: subCompanyId } });

            if (!driver) {
                res.status(404).json({ message: "Driver not found or access denied." });
                return;
            }

            const updates: any = {};
            if (name) updates.name = name;
            if (phone) updates.phone = phone;
            if (email) updates.email = email;

            await driver.update(updates);

            res.status(200).json({ message: "Driver profile updated successfully." });
        } catch (error) {
            console.error("updateDriver error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    banDriver: async (req: Request, res: Response) => {
        try {
            const { driverId } = req.params;

            if (!driverId) {
                res.status(400).json({ message: "Driver ID is required." });
                return;
            }

            const subCompanyId = res.locals.user.agencyId;

            const driver = await User.findOne({ where: { id: driverId, role: "driver", agencyId: subCompanyId } });

            if (!driver) {
                res.status(404).json({ message: "Driver not found or access denied." });
                return;
            }

            await driver.update({ status: "blocked" });

            res.status(200).json({ message: "Driver banned successfully." });
            sendEmail(driver.email, "FastBuss", driver.name, "You have been banned from using FastBuss. Please contact support for more information.");
        } catch (error) {
            console.error("banDriver error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    unbanDriver: async (req: Request, res: Response) => {
        try {
            const { driverId } = req.params;
            const subCompanyId = res.locals.user.agencyId;

            const driver = await User.findOne({ where: { id: driverId, role: "driver", agencyId: subCompanyId } });

            if (!driver) {
                res.status(404).json({ message: "Driver not found or access denied." });
                return;
            }

            await driver.update({ status: "inactive" });

            await sendEmail(driver.email, "FastBuss", driver.name, "You have been unbanned from using FastBuss. Please contact support for more information.");

            res.status(200).json({ message: "Driver unbanned successfully." });
        } catch (error) {
            console.error("unbanDriver error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    deleteDriver: async (req: Request, res: Response) => {
        try {
            const { driverId } = req.params;
            const subCompanyId = res.locals.user.agencyId;

            const driver = await User.findOne({ where: { id: driverId, role: "driver", agencyId: subCompanyId } });

            if (!driver) {
                res.status(404).json({ message: "Driver not found or already deleted." });
                return;
            }

            if (driver.assignedBusId) {
                const bus = await Bus.findOne({ where: { id: driver.assignedBusId, agencyId: subCompanyId } });
                if (bus) {
                    await bus.update({ driverId: null });
                }
            }

            await driver.destroy();

            res.status(200).json({ message: "Driver deleted successfully." });
        } catch (error) {
            console.error("deleteDriver error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    assignDriverToBus: async (req: Request, res: Response) => {
        try {
            const { busId, driverId } = req.body;

            // Input validation
            if (!busId || !driverId) {
                return res.status(400).json({ message: "Bus ID and driver ID are required." });
            }

            const subCompanyId = res.locals.user.agencyId;

            // Use Promise.all to run queries in parallel instead of sequentially
            const [bus, driver, previouslyAssignedBus] = await Promise.all([
                Bus.findOne({ where: { id: busId, agencyId: subCompanyId } }),
                User.findOne({ where: { id: driverId, role: 'driver', agencyId: subCompanyId } }),
                Bus.findOne({ where: { driverId } })
            ]);

            // Validation checks
            if (!bus) return res.status(404).json({ message: "Bus not found." });
            if (!driver) return res.status(404).json({ message: "Driver not found." });

            // If driver is already assigned to another bus, unassign first
            if (previouslyAssignedBus && previouslyAssignedBus.id !== busId) {
                await previouslyAssignedBus.update({ driverId: null });
            }

            // Perform updates in parallel
            await Promise.all([
                bus.update({ driverId: driverId }),
                driver.update({ assignedBusId: busId })
            ]);

            // Prepare email in the background - don't wait for it
            const message = `You have been assigned to a new bus:<br>Name: ${bus.name} <br>Plate Number: ${bus.plateNumber}<br>Please contact support if you have any questions.`;

            // Send the success response immediately
            res.status(200).json({
                message: "Driver assigned to bus successfully.",
                data: { ...bus.toJSON(), driverId: driverId }
            });

            // Send email without awaiting (non-blocking)
            sendEmail(driver.email, "FastBuss", driver.name, message)
                .catch(err => console.error("Failed to send assignment email:", err));

        } catch (error) {
            console.error("assignDriverToBus error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    unassignDriverFromBus: async (req: Request, res: Response) => {
        try {
            const { busId, driverId } = req.body;
            if (!busId && !driverId) {
                res.status(400).json({ message: "Bus ID or driver ID are required." });
                return;
            }

            const subCompanyId = res.locals.user.agencyId;
            const where: any = { agencyId: subCompanyId };
            if (driverId) where.driverId = driverId;
            else where.id = busId;

            const bus = await Bus.findOne({ where });
            if (!bus) return res.status(404).json({ message: "Bus not found." });

            if (!bus.driverId) return res.status(400).json({ message: "Bus has no driver assigned." });

            const driver = await User.findOne({ where: { id: bus.driverId, agencyId: subCompanyId } });
            if (!driver) return res.status(404).json({ message: "Driver not found." });

            await bus.update({ driverId: null });
            await driver.update({ assignedBusId: null, status: "inactive" });

            const message = `You have been unassigned from the bus:<br>Name: ${bus.name} <br>Plate Number: ${bus.plateNumber}<br>Please contact support if you have any questions.`;
            await sendEmail(driver.email, "FastBuss", driver.name, message);

            res.status(200).json({ message: "Driver unassigned from bus successfully." });
        } catch (error) {
            console.error("unassignDriverFromBus error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getAvailableDrivers: async (req: Request, res: Response) => {
        try {
            const subCompanyId = res.locals.user.agencyId;

            const drivers = await User.findAll({
                where: {
                    agencyId: subCompanyId,
                    role: "driver",
                    status: { [Op.notIn]: ["blocked", "banned"] }
                },
                attributes: ["id", "name", "email", "phone", "status", "assignedBusId"]
            });

            // Fetch bus info for each driver
            const mappedDrivers = await Promise.all(drivers.map(async d => {
                let busInfo = null;
                if (d.assignedBusId) {
                    const bus = await Bus.findByPk(d.assignedBusId);
                    if (bus) {
                        busInfo = {
                            id: bus.id,
                            name: bus.name,
                            plateNumber: bus.plateNumber,
                            status: bus.status
                        };
                    }
                }
                return {
                    ...d.toJSON(),
                    _id: d.id.toString(),
                    bus: busInfo
                };
            }));

            res.status(200).json({ message: "Available drivers fetched", data: mappedDrivers });
        } catch (error) {
            console.error("getAvailableDrivers error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getDriverSchedules: async (req: Request, res: Response) => {
        try {
            const driverId = req.params.driverId;

            if (!driverId) {
                res.status(400).json({ message: "Driver ID is required" });
                return;
            }

            const subCompanyId = res.locals.user.agencyId;

            const driver = await User.findOne({ where: { id: driverId, role: "driver", agencyId: subCompanyId } });
            if (!driver) return res.status(404).json({ message: "Driver not found" });

            // TODO: Route/Trip queries need full Sequelize migration
            res.status(200).json({ message: "Driver schedules fetched successfully", data: [] });

        } catch (error) {
            console.error("Error fetching driver schedules:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getTripHistoryByDriver: async (req: Request, res: Response) => {
        try {
            const { driverId } = req.params;
            if (!driverId) {
                res.status(400).json({ message: "Driver ID is required" });
                return;
            }
            const subCompanyId = res.locals.user.agencyId;

            // TODO: Trip queries need full Sequelize migration
            res.status(200).json({ message: "Trip history fetched successfully", data: [] });
        } catch (error) {
            console.error("Error fetching trip history by driver:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },


    // ==================== ROUTE MANAGEMENT ====================
    createRoute: async (req: Request, res: Response) => {
        try {
            const { routeName, origin, destination, distance, adultPrice, childPrice, waypoints,
                originLat, originLng, destinationLat, destinationLng, stops } = req.body;
            const subCompanyId = res.locals.user.agencyId;

            if (!routeName || !origin || !destination || !adultPrice || !childPrice || !distance) {
                return res.status(400).json({ message: "Route name, origin, destination, distance, adult price, and child price are required" });
            }

            const existingRoute = await Route.findOne({
                where: { routeName, agencyId: subCompanyId }
            });

            if (existingRoute) {
                return res.status(400).json({ message: "Route with this name already exists." });
            }

            const newRoute = await Route.create({
                routeName,
                origin,
                destination,
                distance,
                adultPrice,
                childPrice,
                agencyId: subCompanyId,
                status: "active"
            });

            const routeId = (newRoute as any).id;

            // ── Create route stops if provided ──
            if (stops && Array.isArray(stops) && stops.length > 0) {
                try {
                    const stopRecords = stops.map((stop: any, index: number) => ({
                        routeId: routeId,
                        stopOrder: index + 1,
                        stopName: stop.name || stop.stopName,
                        stopType: index === 0 ? "origin" : (index === stops.length - 1 ? "destination" : "intermediate"),
                        arrivalTime: stop.arrivalTime || null,
                        departureTime: stop.departureTime || null,
                        stopDurationMinutes: stop.duration || 5,
                        distanceFromPrevious: stop.distanceFromPrevious || null,
                        latitude: stop.latitude || stop.lat || null,
                        longitude: stop.longitude || stop.lng || null,
                        address: stop.address || null,
                        isActive: true,
                    }));

                    await RouteStop.bulkCreate(stopRecords);
                    console.log(`✅ Created ${stopRecords.length} stops for route ${routeId}`);
                } catch (stopErr) {
                    console.error("Warning: could not create route stops:", stopErr);
                }
            }

            // ── Auto-create bus_points + bus_fare so the website can find this route ──
            try {
                // Find or create origin point (with coordinates for map)
                let [originPoint] = await BusPoint.findOrCreate({
                    where: { name: origin, agencyId: subCompanyId },
                    defaults: {
                        name: origin,
                        agencyId: subCompanyId,
                        ...(originLat && { latitude: originLat }),
                        ...(originLng && { longitude: originLng }),
                    }
                });
                // Find or create destination point
                let [destPoint] = await BusPoint.findOrCreate({
                    where: { name: destination, agencyId: subCompanyId },
                    defaults: {
                        name: destination,
                        agencyId: subCompanyId,
                        ...(destinationLat && { latitude: destinationLat }),
                        ...(destinationLng && { longitude: destinationLng }),
                    }
                });
                // Create bus_fare linking the two points to this route
                await BusFare.create({
                    agencyId: subCompanyId,
                    routeId: routeId,
                    pickup: originPoint.id,
                    dropoff: destPoint.id,
                    amount: Number(adultPrice),
                    currency: "USD",
                });
            } catch (fareErr) {
                console.error("Warning: could not create bus_fare/bus_points:", fareErr);
                // Non-fatal — route is still created
            }

            res.status(201).json({
                message: "Route created successfully",
                route: {
                    id: routeId,
                    routeName,
                    origin,
                    destination,
                    adultPrice,
                    childPrice,
                    distance,
                    waypoints,
                    stopsCount: stops?.length || 0,
                }
            });
        } catch (error) {
            console.error("Error creating route:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    createRouteSchedule: async (req: Request, res: Response) => {
        try {
            const { routeId, driverId, departureTime, arrivalTime, stops, departureBusStation, arrivalBusStation } = req.body;
            const subCompanyId = res.locals.user.agencyId;

            if (!routeId || !driverId || !departureTime || !arrivalTime) {
                return res.status(400).json({ message: "routeId, driverId, departureTime, and arrivalTime are required" });
            }

            // Validate stops if provided
            if (stops && (!Array.isArray(stops) || stops.some((stop: any) =>
                !stop.location || !stop.arrivalTime || !stop.departureTime
            ))) {
                return res.status(400).json({ message: "Each stop must have location, arrivalTime, and departureTime" });
            }

            const [route, driver] = await Promise.all([
                Route.findOne({ where: { id: routeId, agencyId: subCompanyId } }),
                User.findOne({ where: { id: driverId, role: 'driver', agencyId: subCompanyId } })
            ]);

            if (!route) {
                return res.status(404).json({ message: "Route not found" });
            }
            if (!driver) {
                return res.status(404).json({ message: "Driver not found" });
            }
            if (driver.status === "blocked") {
                return res.status(400).json({ message: "Driver is blocked" });
            }
            // "active" means driver is currently on a trip — only block if they have an active trip
            // Check if this driver's bus is already on an active trip
            if (driver.assignedBusId) {
                const busOnTrip = await Trip.findOne({
                    where: { busId: driver.assignedBusId, status: ['scheduled', 'delayed'] }
                });
                if (busOnTrip) {
                    return res.status(400).json({ message: "Driver's bus is already on an active trip" });
                }
            }

            const bus = await Bus.findOne({ where: { id: driver.assignedBusId, agencyId: subCompanyId } });
            if (!bus) {
                return res.status(404).json({ message: "Bus not found" });
            }

            if (bus.status === "maintenance") return res.status(400).json({ message: "Bus Assigned To Driver Is Under Maintenance" });
            if (bus.status === "blocked") return res.status(400).json({ message: "Bus is blocked" });

            // TODO: Trip conflict check needs Sequelize migration (Trip still Mongoose)
            const seats = await seatController.initializeSeats(bus.capacity);
            if (!seats) {
                return;
            }

            // Find the bus_fare for this route so the website can link schedule → fare
            let busfareId: number | undefined;
            try {
                const fare = await BusFare.findOne({ where: { routeId: route._id || (route as any).id, agencyId: subCompanyId } });
                if (fare) busfareId = fare.id;
            } catch (_) { }

            const schedule = await Trip.create({
                agencyId: subCompanyId,
                busId: bus.id,
                routeId: route._id || (route as any).id,
                busfareId,
                departureDate: new Date(departureTime).toISOString().split("T")[0],
                departureTime: new Date(departureTime).toTimeString().split(" ")[0],
                arrivalTime: new Date(arrivalTime).toTimeString().split(" ")[0],
                status: "scheduled",
                groupId: Date.now(),
                ...(departureBusStation && { departureBusStation }),
                ...(arrivalBusStation && { arrivalBusStation }),
            });

            await bus.update({ status: "active" });
            await driver.update({ status: "active" });

            res.status(201).json({
                message: "Route schedule created successfully",
                schedule
            });

            const message = `You have been assigned to a new route:<br>Route Name: ${(route as any).routeName} <br>Origin: ${(route as any).origin} <br>Destination: ${(route as any).destination} <br>Departure Time: ${departureTime} <br>Arrival Time: ${arrivalTime} <br>Please contact support if you have any questions.`;
            sendEmail(driver.email, "FastBuss", driver.name, message);

        } catch (error) {
            console.error("Error creating route schedule:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getAllRoutesBySubCompany: async (req: Request, res: Response) => {
        try {
            const subCompanyId = res.locals.user.agencyId;

            const routes = await Route.findAll({ where: { agencyId: subCompanyId } });
            
            // Fetch stops for all routes
            const routeIds = routes.map(r => r.id);
            const allStops = await RouteStop.findAll({
                where: { routeId: routeIds, isActive: true },
                order: [['routeId', 'ASC'], ['stopOrder', 'ASC']]
            });

            // Group stops by routeId
            const stopsByRoute = allStops.reduce((acc: any, stop) => {
                if (!acc[stop.routeId]) acc[stop.routeId] = [];
                acc[stop.routeId].push(stop.toJSON());
                return acc;
            }, {});

            const mappedRoutes = routes.map(route => ({
                ...route.toJSON(),
                _id: route.id,
                // Ensure prices are numbers
                adultPrice: Number(route.adultPrice),
                childPrice: Number(route.childPrice),
                distance: Number(route.distance),
                stops: stopsByRoute[route.id] || []
            }));

            res.status(200).json({ message: "Routes fetched successfully", data: mappedRoutes });
        } catch (error) {
            console.error("Error fetching routes:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    updateRoute: async (req: Request, res: Response) => {
        try {
            const { routeId } = req.params;

            if (!routeId) {
                return res.status(400).json({ message: "Route ID is required" });
            }

            const { routeName, origin, destination, distance, adultPrice, childPrice, status } = req.body;
            const subCompanyId = res.locals.user.agencyId;

            const route = await Route.findOne({ where: { id: routeId, agencyId: subCompanyId } });
            if (!route) {
                return res.status(404).json({ message: "Route not found" });
            }

            if (routeName && routeName !== route.routeName) {
                const existingRoute = await Route.findOne({
                    where: {
                        routeName,
                        agencyId: subCompanyId,
                        id: { [Op.ne]: routeId }
                    }
                });

                if (existingRoute) {
                    return res.status(400).json({ message: "Route with this name already exists" });
                }
            }

            if (routeName) route.routeName = routeName;
            if (origin) route.origin = origin;
            if (destination) route.destination = destination;
            if (distance !== undefined) route.distance = distance;
            if (adultPrice !== undefined) route.adultPrice = adultPrice;
            if (childPrice !== undefined) route.childPrice = childPrice;
            if (status) route.status = status;

            await route.save();

            // ── Sync bus_fare price if adultPrice changed ──
            if (adultPrice !== undefined) {
                try {
                    await BusFare.update(
                        { amount: Number(adultPrice) },
                        { where: { routeId: (route as any).id, agencyId: subCompanyId } }
                    );
                } catch (fareErr) {
                    console.error("Warning: could not sync bus_fare price:", fareErr);
                }
            }

            return res.status(200).json({ message: "Route updated successfully", route: route });
        } catch (error) {
            console.error("Error updating route:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },

    deleteRoute: async (req: Request, res: Response) => {
        try {
            const { routeId } = req.params;
            if (!routeId) {
                res.status(400).json({ message: "Route ID is required" });
                return;
            }
            const subCompanyId = res.locals.user.agencyId;

            // Clean up bus_fares for this route first
            try {
                await BusFare.destroy({ where: { routeId, agencyId: subCompanyId } });
            } catch (fareErr) {
                console.error("Warning: could not delete bus_fares:", fareErr);
            }

            const result = await Route.destroy({ where: { id: routeId, agencyId: subCompanyId } });
            if (result === 0) return res.status(404).json({ message: "Route not found" });

            res.status(200).json({ message: "Route deleted successfully" });
        } catch (error) {
            console.error("Error deleting route:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    deactivateRoute: async (req: Request, res: Response) => {
        try {
            const { routeId } = req.params;
            if (!routeId) {
                res.status(400).json({ message: "Route ID is required" });
                return;
            }
            const subCompanyId = res.locals.user.agencyId;

            const route = await Route.findOne({ where: { id: routeId, agencyId: subCompanyId } });
            if (!route) return res.status(404).json({ message: "Route not found" });
            if (route.status === "inactive") return res.status(400).json({ message: "Route is already inactive" });

            route.status = "inactive";
            await route.save();

            res.status(200).json({ message: "Route deactivated successfully" });

        } catch (error) {
            console.error("Error deactivating route:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    activateRoute: async (req: Request, res: Response) => {
        try {
            const { routeId } = req.params;
            const subCompanyId = res.locals.user.agencyId;

            const route = await Route.findOne({ where: { id: routeId, agencyId: subCompanyId } });
            if (!route) return res.status(404).json({ message: "Route not found" });
            if (route.status === "active") return res.status(400).json({ message: "Route is already active" });

            route.status = "active";
            await route.save();

            res.status(200).json({ message: "Route activated successfully" });

        } catch (error) {
            console.error("Error activating route:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    changeBusInSchedule: async (req: Request, res: Response) => {
        try {
            const { scheduleId, newBusId } = req.body;
            if (!scheduleId || !newBusId) {
                res.status(400).json({ message: "Schedule ID and new bus ID are required" });
                return;
            }
            const subCompanyId = res.locals.user.agencyId;

            const schedule = await Trip.findOne({ where: { id: scheduleId, agencyId: subCompanyId } });
            if (!schedule) return res.status(404).json({ message: "Schedule not found" });

            const newBus = await Bus.findOne({ where: { id: newBusId, agencyId: subCompanyId } });
            if (!newBus) return res.status(404).json({ message: "New bus not found" });
            if (newBus.status === "active") return res.status(400).json({ message: "New bus you want to assign is on a trip" });
            if (newBus.driverId === null) return res.status(400).json({ message: "New bus has no driver assigned" });

            const newDriver = await User.findOne({ where: { id: newBus.driverId, role: "driver", agencyId: subCompanyId } });
            if (!newDriver) return res.status(404).json({ message: "New driver not found" });

            await schedule.update({ busId: newBusId });

            const message = `You have been reassigned to an urgent bus:<br>Name: ${newBus.name} <br>Plate Number: ${newBus.plateNumber}<br>Please contact support if you have any questions.`;
            await sendEmail(newDriver.email, "FastBuss", newDriver.name, message);

            res.status(200).json({ message: "Bus reassigned successfully" });
        } catch (error) {
            console.error("Error rescheduling bus:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },


    // ==================== TRIP MANAGEMENT ====================
    getTripHistory: async (req: Request, res: Response) => {
        try {
            const { status, startDate, endDate } = req.query;
            const subCompanyId = res.locals.user.agencyId;

            const where: any = { agencyId: subCompanyId };
            if (status) {
                where.status = status;
            }
            if (startDate && endDate) {
                const start = new Date(startDate as string);
                const end = new Date(endDate as string);
                end.setHours(23, 59, 59, 999);
                where.departureDate = { [Op.between]: [start, end] };
            }
            const trips = await Trip.findAll({ where });
            const mappedTrips = await Promise.all(trips.map(async trip => {
                const tripData = trip.toJSON();

                // Fetch related data manually as associations are not defined in models
                const [route, bus] = await Promise.all([
                    Route.findByPk(trip.routeId),
                    Bus.findByPk(trip.busId)
                ]);

                let driverName = "N/A";
                let driverId = null;
                if (bus && bus.driverId) {
                    const driver = await User.findByPk(bus.driverId);
                    if (driver) {
                        driverName = driver.name;
                        driverId = driver.id;
                    }
                }

                return {
                    ...tripData,
                    _id: trip.id.toString(),
                    routeName: route ? (route.routeName || `${route.origin} → ${route.destination}`) : "Unknown Route",
                    origin: route ? route.origin : "N/A",
                    destination: route ? route.destination : "N/A",
                    busName: bus ? bus.name : "Unknown Bus",
                    busId: bus ? bus.id.toString() : null,
                    driverName,
                    driverId: driverId ? driverId.toString() : null,
                    // Map DB status to frontend expected values
                    status: trip.status === 'scheduled' ? 'scheduled' :
                        trip.status === 'delayed' ? 'in-progress' :
                            trip.status,
                    // Combine date + time for frontend datetime parsing
                    departureTime: trip.departureDate + 'T' + trip.departureTime,
                    arrivalTime: trip.departureDate + 'T' + trip.arrivalTime,
                    stops: 0
                };
            }));
            res.status(200).json({ message: "Trip history fetched successfully", data: mappedTrips });
        } catch (error) {
            console.error("Error fetching trip history:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getTripDetails: async (req: Request, res: Response) => {
        try {
            const { tripId } = req.params;
            if (!tripId) {
                res.status(400).json({ message: "Trip ID is required" });
                return;
            }
            const subCompanyId = res.locals.user.agencyId;

            const trip = await Trip.findOne({ where: { id: tripId, agencyId: subCompanyId } });
            if (!trip) return res.status(404).json({ message: "Trip not found" });

            // Fetch related bus data via Sequelize
            const bus = trip.busId ? await Bus.findByPk(trip.busId) : null;

            const response = {
                tripId: trip.id,
                status: trip.status,
                departureDate: trip.departureDate,
                departureTime: trip.departureTime,
                arrivalTime: trip.arrivalTime,
                bus: bus ? {
                    name: bus.name,
                    plateNumber: bus.plateNumber,
                    type: bus.busType,
                    capacity: bus.capacity
                } : null
            };

            res.status(200).json({ message: "Trip details fetched successfully", data: response });
        } catch (error) {
            console.error("Error fetching trip details:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    cancelTrip: async (req: Request, res: Response) => {
        try {
            const { tripId } = req.params;
            if (!tripId) {
                res.status(400).json({ message: "Trip ID is required" });
                return;
            }
            const subCompanyId = res.locals.user.agencyId;

            const trip = await Trip.findOne({ where: { id: tripId, agencyId: subCompanyId } });
            if (!trip) return res.status(404).json({ message: "Trip not found" });

            if (trip.status === "scheduled") {
                await trip.update({ status: "cancelled" });
            }

            if (trip.busId) {
                const bus = await Bus.findOne({ where: { id: trip.busId, agencyId: subCompanyId } });
                if (bus) {
                    await bus.update({ status: "inactive" });
                }
            }

            res.status(200).json({ message: "Trip cancelled successfully" });

        } catch (error) {
            console.error("Error canceling trip:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getTripHistoryByBus: async (req: Request, res: Response) => {
        try {
            const { busId } = req.params;
            if (!busId) {
                res.status(400).json({ message: "Bus ID is required" });
                return;
            }
            const subCompanyId = res.locals.user.agencyId;

            const trips = await Trip.findAll({ where: { busId, agencyId: subCompanyId } });
            res.status(200).json({ message: "Trip history fetched successfully", data: trips });
        } catch (error) {
            console.error("Error fetching trip history by bus:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getTripHistoryBySubCompany: async (req: Request, res: Response) => {
        try {
            const subCompanyId = res.locals.user.agencyId;
            const trips = await Trip.findAll({ where: { agencyId: subCompanyId } });
            res.status(200).json({ message: "Trip history fetched successfully", data: trips });
        } catch (error) {
            console.error("Error fetching trip history by sub company:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    updateTrip: async (req: Request, res: Response) => {
        try {
            const subCompanyId = res.locals.user.agencyId;
            const { tripId, departureTime, arrivalTime } = req.body;

            if (!tripId) return res.status(400).json({ message: "Trip ID is required" });
            if (!departureTime && !arrivalTime) {
                return res.status(400).json({ message: "At least one field is required" });
            }

            const trip = await Trip.findOne({ where: { id: tripId, agencyId: subCompanyId } });
            if (!trip) return res.status(404).json({ message: "Trip not found" });

            const updates: any = {};
            if (departureTime) updates.departureTime = departureTime;
            if (arrivalTime) updates.arrivalTime = arrivalTime;

            await trip.update(updates);

            res.status(200).json({ message: "Trip updated successfully", data: trip });

        } catch (error) {
            console.error("Error updating trip:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getAllSchedules: async (req: Request, res: Response) => {
        try {
            const subCompanyId = res.locals.user.agencyId;
            const { status, startDate, endDate } = req.query;

            const where: any = { agencyId: subCompanyId };

            if (status) {
                where.status = status;
            }

            if (startDate && endDate) {
                where.departureDate = {
                    [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
                };
            }

            const schedules = await Trip.findAll({
                where,
                order: [["departureTime", "ASC"]]
            });

            const mappedSchedules = schedules.map(schedule => ({
                ...schedule.toJSON(),
                _id: schedule.id
            }));

            res.status(200).json({
                message: "Schedules fetched successfully",
                data: mappedSchedules
            });
        } catch (error) {
            console.error("Error fetching schedules:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    deleteSchedule: async (req: Request, res: Response) => {
        try {
            const { scheduleId } = req.params;
            const subCompanyId = res.locals.user.agencyId;

            if (!scheduleId) {
                return res.status(400).json({ message: "Schedule ID is required" });
            }

            const schedule = await Trip.findOne({ where: { id: scheduleId, agencyId: subCompanyId } });
            if (!schedule) {
                return res.status(404).json({ message: "Schedule not found" });
            }

            await schedule.destroy();

            res.status(200).json({
                message: "Schedule deleted successfully"
            });
        } catch (error) {
            console.error("Error deleting schedule:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },


    // ==================== BOOKINGS MANAGEMENT ====================
    getBookings: async (req: Request, res: Response) => {
        try {
            const subCompanyId = res.locals.user.agencyId;
            if (!subCompanyId) {
                res.status(200).json({ message: "No agency", data: [], stats: { total: 0, confirmed: 0, pending: 0, cancelled: 0, totalRevenue: 0 } });
                return;
            }

            const { status, busId, startDate, endDate } = req.query;

            // Query bookings directly by agency_id (set by Laravel when booking is created)
            const bookingWhere: any = { agencyId: subCompanyId };
            if (status && status !== 'all') bookingWhere.status = status;
            if (startDate && endDate) {
                bookingWhere.createdAt = { [Op.between]: [new Date(startDate as string), new Date(endDate as string)] };
            }

            const bookings = await Booking.findAll({ where: bookingWhere, order: [['created_at', 'DESC']] });

            if (!bookings.length) {
                res.status(200).json({ message: "No bookings found", data: [], stats: { total: 0, confirmed: 0, pending: 0, cancelled: 0, totalRevenue: 0 } });
                return;
            }

            // Fetch all trips for these bookings in one query
            const tripIds = [...new Set(bookings.map(b => b.tripId))];
            const trips = await Trip.findAll({ where: { id: { [Op.in]: tripIds } } });

            // Filter by busId if provided
            const filteredBookings = busId && busId !== 'all'
                ? bookings.filter(b => {
                    const trip = trips.find(t => t.id === b.tripId);
                    return trip && String(trip.busId) === String(busId);
                })
                : bookings;

            // Fetch all buses and routes in bulk
            const busIds = [...new Set(trips.map(t => t.busId))];
            const routeIds = [...new Set(trips.map(t => t.routeId))];
            const [laravelBuses, laravelRoutes] = await Promise.all([
                Bus.findAll({ where: { id: { [Op.in]: busIds } } }),
                Route.findAll({ where: { id: { [Op.in]: routeIds } } }),
            ]);

            const mapped = filteredBookings.map(b => {
                const trip = trips.find(t => t.id === b.tripId);
                const bus = trip ? laravelBuses.find(bus => bus.id === trip.busId) : null;
                const route = trip ? laravelRoutes.find(r => r.id === trip.routeId) : null;
                return {
                    id: b.id.toString(),
                    userId: b.userId,
                    userName: b.contactEmail || 'Passenger',
                    userEmail: b.contactEmail || 'N/A',
                    tripId: b.tripId,
                    busName: bus?.name || 'N/A',
                    busPlate: bus?.plateNumber || 'N/A',
                    routeName: route ? `${route.origin} → ${route.destination}` : 'N/A',
                    origin: route?.origin || 'N/A',
                    destination: route?.destination || 'N/A',
                    departureDate: trip?.departureDate || 'N/A',
                    departureTime: trip?.departureTime || 'N/A',
                    totalAmount: Number(b.totalPrice),
                    status: b.status,
                    createdAt: (b as any).created_at || (b as any).createdAt || new Date().toISOString(),
                };
            });

            const stats = {
                total: mapped.length,
                confirmed: mapped.filter(b => b.status === 'confirmed').length,
                pending: mapped.filter(b => b.status === 'pending').length,
                cancelled: mapped.filter(b => b.status === 'cancelled').length,
                totalRevenue: mapped.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 0),
            };

            res.status(200).json({ message: "Bookings fetched", data: mapped, stats });
        } catch (error) {
            console.error("getBookings error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getBookingsBusSummary: async (req: Request, res: Response) => {
        try {
            const subCompanyId = res.locals.user.agencyId;
            if (!subCompanyId) {
                res.status(200).json({ message: "No agency", data: [] });
                return;
            }

            // Get all bookings and trips for this agency at once
            const [allBookings, allTrips, agencyBuses] = await Promise.all([
                Booking.findAll({ where: { agencyId: subCompanyId } }),
                Trip.findAll({ where: { agencyId: subCompanyId } }),
                Bus.findAll({ where: { agencyId: subCompanyId } }),
            ]);

            if (!agencyBuses.length) {
                res.status(200).json({ message: "No buses", data: [] });
                return;
            }

            const summary = agencyBuses.map(bus => {
                const busTrips = allTrips.filter(t => t.busId === bus.id);
                const busTripIds = busTrips.map(t => t.id);
                const bookings = allBookings.filter(b => busTripIds.includes(b.tripId));

                const confirmed = bookings.filter(b => b.status === 'confirmed').length;
                const pending = bookings.filter(b => b.status === 'pending').length;
                const cancelled = bookings.filter(b => b.status === 'cancelled').length;
                const revenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + Number(b.totalPrice), 0);
                const totalSeats = busTrips.length * bus.capacity;
                const occupancy = totalSeats > 0 ? Math.round((confirmed / totalSeats) * 100) : 0;

                return {
                    busId: bus.id,
                    busName: bus.name,
                    busPlate: bus.plateNumber,
                    capacity: bus.capacity,
                    totalBookings: bookings.length,
                    confirmedBookings: confirmed,
                    pendingBookings: pending,
                    cancelledBookings: cancelled,
                    totalRevenue: revenue,
                    occupancyRate: Math.min(occupancy, 100),
                };
            });

            res.status(200).json({ message: "Bus booking summary fetched", data: summary });
        } catch (error) {
            console.error("getBookingsBusSummary error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // ==================== NOTIFICATION MANAGEMENT ====================
    sendBulkNotification: async (req: Request, res: Response) => {
        try {
            const { title, message, recipients } = req.body;
            const subCompanyId = res.locals.user.agencyId;

            if (!title || !message || !recipients || !Array.isArray(recipients)) {
                return res.status(400).json({ message: "Title, message, and recipients array are required" });
            }

            const users = await User.findAll({
                where: {
                    id: recipients,
                    agencyId: subCompanyId
                }
            });

            const emailPromises = users.map((user: any) =>
                sendEmail(user.email, title, user.name, message)
            );

            await Promise.all(emailPromises);

            res.status(200).json({
                message: "Bulk notification sent successfully",
                data: {
                    totalRecipients: users.length,
                    emailsSent: emailPromises.length
                }
            });
        } catch (error) {
            console.error("Error sending bulk notification:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // ==================== ROUTE STOPS MANAGEMENT ====================
    getRouteStops: async (req: Request, res: Response) => {
        try {
            const { routeId } = req.params;
            const subCompanyId = res.locals.user.agencyId;

            if (!routeId) {
                return res.status(400).json({ message: "Route ID is required" });
            }

            // Verify route belongs to this agency
            const route = await Route.findOne({ where: { id: routeId, agencyId: subCompanyId } });
            if (!route) {
                return res.status(404).json({ message: "Route not found" });
            }

            const stops = await RouteStop.findAll({
                where: { routeId, isActive: true },
                order: [['stopOrder', 'ASC']]
            });

            res.status(200).json({
                message: "Route stops fetched successfully",
                data: stops
            });
        } catch (error) {
            console.error("Error fetching route stops:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    addRouteStop: async (req: Request, res: Response) => {
        try {
            const { routeId } = req.params;
            const { stopName, stopOrder, arrivalTime, departureTime, stopDurationMinutes, 
                    distanceFromPrevious, latitude, longitude, address } = req.body;
            const subCompanyId = res.locals.user.agencyId;

            if (!routeId || !stopName) {
                return res.status(400).json({ message: "Route ID and stop name are required" });
            }

            // Verify route belongs to this agency
            const route = await Route.findOne({ where: { id: routeId, agencyId: subCompanyId } });
            if (!route) {
                return res.status(404).json({ message: "Route not found" });
            }

            // Determine stop order if not provided
            let order = stopOrder;
            if (!order) {
                const maxOrder = await RouteStop.max('stopOrder', { where: { routeId } }) as number;
                order = (maxOrder || 0) + 1;
            }

            // Determine stop type based on order
            const totalStops = await RouteStop.count({ where: { routeId, isActive: true } });
            let stopType: "origin" | "intermediate" | "destination" = "intermediate";
            if (order === 1) stopType = "origin";
            else if (order === totalStops + 1) stopType = "destination";

            const newStop = await RouteStop.create({
                routeId: Number(routeId),
                stopOrder: order,
                stopName,
                stopType,
                arrivalTime: arrivalTime || null,
                departureTime: departureTime || null,
                stopDurationMinutes: stopDurationMinutes || 5,
                distanceFromPrevious: distanceFromPrevious || null,
                latitude: latitude || null,
                longitude: longitude || null,
                address: address || null,
                isActive: true,
            });

            res.status(201).json({
                message: "Route stop added successfully",
                data: newStop
            });
        } catch (error) {
            console.error("Error adding route stop:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    updateRouteStop: async (req: Request, res: Response) => {
        try {
            const { stopId } = req.params;
            const { stopName, stopOrder, arrivalTime, departureTime, stopDurationMinutes,
                    distanceFromPrevious, latitude, longitude, address } = req.body;
            const subCompanyId = res.locals.user.agencyId;

            if (!stopId) {
                return res.status(400).json({ message: "Stop ID is required" });
            }

            const stop = await RouteStop.findByPk(stopId);
            if (!stop) {
                return res.status(404).json({ message: "Stop not found" });
            }

            // Verify route belongs to this agency
            const route = await Route.findOne({ where: { id: stop.routeId, agencyId: subCompanyId } });
            if (!route) {
                return res.status(404).json({ message: "Route not found or access denied" });
            }

            const updates: any = {};
            if (stopName) updates.stopName = stopName;
            if (stopOrder) updates.stopOrder = stopOrder;
            if (arrivalTime !== undefined) updates.arrivalTime = arrivalTime;
            if (departureTime !== undefined) updates.departureTime = departureTime;
            if (stopDurationMinutes !== undefined) updates.stopDurationMinutes = stopDurationMinutes;
            if (distanceFromPrevious !== undefined) updates.distanceFromPrevious = distanceFromPrevious;
            if (latitude !== undefined) updates.latitude = latitude;
            if (longitude !== undefined) updates.longitude = longitude;
            if (address !== undefined) updates.address = address;

            await stop.update(updates);

            res.status(200).json({
                message: "Route stop updated successfully",
                data: stop
            });
        } catch (error) {
            console.error("Error updating route stop:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    deleteRouteStop: async (req: Request, res: Response) => {
        try {
            const { stopId } = req.params;
            const subCompanyId = res.locals.user.agencyId;

            if (!stopId) {
                return res.status(400).json({ message: "Stop ID is required" });
            }

            const stop = await RouteStop.findByPk(stopId);
            if (!stop) {
                return res.status(404).json({ message: "Stop not found" });
            }

            // Verify route belongs to this agency
            const route = await Route.findOne({ where: { id: stop.routeId, agencyId: subCompanyId } });
            if (!route) {
                return res.status(404).json({ message: "Route not found or access denied" });
            }

            // Soft delete by setting isActive to false
            await stop.update({ isActive: false });

            res.status(200).json({ message: "Route stop deleted successfully" });
        } catch (error) {
            console.error("Error deleting route stop:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
};
