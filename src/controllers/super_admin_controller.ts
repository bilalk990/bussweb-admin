import { Request, Response } from "express";
import BusAgency from "../models/bus_agency_model";
import { uploadToCloudinary } from "../middlewares/upload_middleware";
import bcrypt from "bcryptjs";
import User from "../models/user_model";
import Bus from "../models/bus_model";
import { Op } from "sequelize";
import { sequelize } from "../config/database";

export const superAdminController = {

    createCompany: async (req: Request, res: Response) => {
        try {
            const { agencyName, contactEmail, contactPhone, description, adminName, adminPassword } = req.body;

            if (!agencyName || !contactEmail || !contactPhone || !description || !adminName || !adminPassword) {
                res.status(400).json({ message: "All fields are required." });
                return;
            }

            if (!req.file) {
                res.status(400).json({ message: "Logo is required." });
                return;
            }

            const existing = await BusAgency.findOne({ where: { agencyName: agencyName } });
            if (existing) {
                res.status(409).json({ message: "Agency with this name already exists." });
                return;
            }

            const existingUser = await User.findOne({ where: { email: contactEmail } });
            if (existingUser) {
                res.status(409).json({ message: "Sub-admin email is already taken." });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            const result = await uploadToCloudinary(req.file!, "sub_company_logos") as { secure_url?: string, url?: string };
            if (!result) {
                res.status(400).json({ message: "Failed to upload logo." });
                return;
            }

            const logoUrl = result.secure_url ?? result.url!;
            const now = new Date();

            // Use raw query because bus_agencies has many NOT NULL fields from Laravel schema
            await sequelize.query(
                `INSERT INTO bus_agencies 
                 (agency_name, email, phone, agency_description, agency_logo, status, login_type, 
                  last_name, address, is_verified, parcel_delivery, creer, modifier, updated_at)
                 VALUES (?, ?, ?, ?, ?, 'no', 'email', ?, 'N/A', 1, 'no', ?, ?, ?)`,
                { replacements: [agencyName, contactEmail, contactPhone, description, logoUrl, adminName, now, now, now] }
            );

            // Get the newly created agency
            const newCompany = await BusAgency.findOne({ where: { agencyName } });
            if (!newCompany) {
                res.status(500).json({ message: "Failed to retrieve created agency." });
                return;
            }

            await User.create({
                name: adminName,
                email: contactEmail,
                password: hashedPassword,
                role: "sub_admin",
                agencyId: newCompany.id,
                status: "active",
                emailVerifiedAt: new Date(),
            });

            res.status(201).json({ message: "Agency created successfully" });
        } catch (error: any) {
            console.error("Agency creation error:", error);
            res.status(500).json({ message: "Internal server error: " + (error.message || String(error)) });
        }
    },

    list: async (_req: Request, res: Response) => {
        try {
            const companies = await BusAgency.findAll();
            // Map to frontend-expected shape
            const mapped = companies.map(c => ({
                id: String(c.id),
                agencyName: c.agencyName || '',
                logo: c.logo || '',
                contactEmail: c.contactEmail || '',
                contactPhone: c.contactPhone || '',
                description: c.description || '',
                isActive: !!c.isActive,
                createdAt: new Date().toISOString(), // bus_agencies uses non-standard timestamp
                updatedAt: new Date().toISOString(),
            }));
            res.status(200).json({ data: mapped });
        } catch (error) {
            console.error("Fetch Agencies error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    },

    deleteCompany: async (req: Request, res: Response) => {
        try {
            const { companyId } = req.params;

            if (!companyId) {
                res.status(400).json({ message: "Agency ID is required" });
                return;
            }

            const company = await BusAgency.findByPk(companyId);
            if (!company) {
                return res.status(404).json({ message: "Agency not found" });
            }

            // Delete all associated users
            await User.destroy({ where: { agencyId: companyId } });

            // Delete all associated buses
            await Bus.destroy({ where: { agencyId: companyId } });

            // Delete the company
            await BusAgency.destroy({ where: { id: companyId } });

            res.status(200).json({ message: "Agency and all associated data deleted successfully" });
        } catch (error) {
            console.error("Delete agency error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    suspendCompany: async (req: Request, res: Response) => {
        try {
            const { companyId } = req.params;

            if (!companyId) {
                res.status(400).json({ message: "Agency ID is required" });
                return;
            }

            const company = await BusAgency.findByPk(companyId);
            if (!company) {
                return res.status(404).json({ message: "Agency not found" });
            }

            // Update company status
            company.isActive = false;
            await company.save();

            // Update all users' status to blocked
            await User.update(
                { status: "blocked" },
                { where: { agencyId: companyId } }
            );

            res.status(200).json({ message: "Agency suspended successfully" });
        } catch (error) {
            console.error("Suspend agency error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    activateCompany: async (req: Request, res: Response) => {
        try {
            const { companyId } = req.params;

            if (!companyId) {
                res.status(400).json({ message: "Agency ID is required" });
                return;
            }

            const company = await BusAgency.findByPk(companyId);
            if (!company) {
                return res.status(404).json({ message: "Agency not found" });
            }

            // Update company status
            company.isActive = true;
            await company.save();

            // Update all users' status to active
            await User.update(
                { status: "inactive" },
                { where: { agencyId: companyId } }
            );

            res.status(200).json({ message: "Agency activated successfully" });
        } catch (error) {
            console.error("Activate agency error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    updateCompany: async (req: Request, res: Response) => {
        try {
            const { companyId, agencyName, contactEmail, contactPhone, description } = req.body;

            if (!companyId) {
                res.status(400).json({ message: "Agency ID is required" });
                return;
            }

            if (!agencyName && !contactEmail && !contactPhone && !description) {
                res.status(400).json({ message: "No updates provided" });
                return;
            }

            const company = await BusAgency.findByPk(companyId);
            if (!company) {
                return res.status(404).json({ message: "Agency not found" });
            }

            // Check if new company name is unique
            if (agencyName && agencyName !== company.agencyName) {
                const existing = await BusAgency.findOne({ where: { agencyName: agencyName } });
                if (existing) {
                    return res.status(409).json({ message: "Agency name already exists" });
                }
            }

            // Update company details
            company.agencyName = agencyName || company.agencyName;
            company.contactEmail = contactEmail || company.contactEmail;
            company.contactPhone = contactPhone || company.contactPhone;
            company.description = description || company.description;

            // Update logo if provided
            if (req.file) {
                const result = await uploadToCloudinary(req.file, "logo") as { secure_url?: string, url?: string };
                if (result) {
                    company.logo = result.secure_url ?? result.url!;
                }
            }

            await company.save();
            res.status(200).json({ message: "Agency updated successfully", data: company });
        } catch (error) {
            console.error("Update agency error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    viewCompanyDetails: async (req: Request, res: Response) => {
        try {
            const { companyId } = req.params;

            if (!companyId) {
                res.status(400).json({ message: "Agency ID is required" });
                return;
            }

            const company = await BusAgency.findByPk(companyId);
            if (!company) {
                return res.status(404).json({ message: "Agency not found" });
            }

            // Get counts of associated data
            const staffCount = await User.count({
                where: {
                    agencyId: companyId,
                    role: { [Op.in]: ['sub_admin', 'staff', 'driver'] }
                }
            });

            const busCount = await Bus.count({ where: { agencyId: companyId } });

            const driverCount = await User.count({
                where: {
                    agencyId: companyId,
                    role: 'driver'
                }
            });

            // Get company details with counts
            const companyDetails = {
                id: String(company.id),
                agencyName: company.agencyName || '',
                logo: company.logo || '',
                contactEmail: company.contactEmail || '',
                contactPhone: company.contactPhone || '',
                description: company.description || '',
                isActive: !!company.isActive,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                staffCount,
                busCount,
                driverCount
            };

            res.status(200).json({ data: companyDetails });
        } catch (error) {
            console.error("View agency details error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};
