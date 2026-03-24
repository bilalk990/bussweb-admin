import { Request, Response } from "express";
import SupportTicket from "../models/support_ticket_model";
import User from "../models/user_model";
import { sendEmail, sendBulkEmail } from "../services/email_service";
import { uploadToCloudinary } from "../middlewares/upload_middleware";

export const supportTicketController = {
    // Create a new support ticket
    createTicket: async (req: Request, res: Response) => {
        try {
            const userId = res.locals.userId;
            const { subject, description, category, priority } = req.body;
            const files = req.files as Express.Multer.File[];

            if (!subject || !description || !category) {
                return res.status(400).json({ message: "Subject, description, and category are required" });
            }

            let attachments: string[] = [];
            if (files && files.length > 0) {
                const uploadPromises = files.map(file => uploadToCloudinary(file, "support-tickets"));
                const uploadResults = await Promise.all(uploadPromises);
                attachments = uploadResults.map((result: any) => result.secure_url);
            }

            const ticket = await SupportTicket.create({
                userId,
                subject,
                description,
                category,
                priority: priority || "medium",
                attachments,
            });

            // Notify admins
            try {
                const admins = await User.findAll({ where: { role: ["super_admin", "sub_admin"] } });
                const user = await User.findByPk(userId);
                if (user && admins.length > 0) {
                    const adminEmails = admins.map(a => a.email);
                    const message = `New support ticket by ${user.name} (${user.email})<br>Subject: ${subject}<br>Category: ${category}<br>Priority: ${priority || "medium"}<br>Description: ${description}`;
                    await sendBulkEmail(adminEmails, "New Support Ticket Created", "Admin", message);
                }
            } catch (emailErr) {
                console.error("Failed to send admin notifications:", emailErr);
            }

            res.status(201).json({ message: "Support ticket created successfully", data: ticket });
        } catch (error) {
            console.error("createTicket error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // Get all tickets for a user
    getUserTickets: async (req: Request, res: Response) => {
        try {
            const userId = res.locals.userId;
            const tickets = await SupportTicket.findAll({
                where: { userId },
                order: [["createdAt", "DESC"]],
            });

            const user = await User.findByPk(userId);
            const userInfo = { _id: String(userId), name: user?.name || "Unknown", email: user?.email || "" };

            const data = tickets.map(t => ({
                _id: String(t.id),
                user: userInfo,
                subject: t.subject,
                description: t.description,
                status: t.status,
                priority: t.priority,
                category: t.category,
                attachments: t.attachments || [],
                createdAt: t.createdAt,
                updatedAt: t.updatedAt,
            }));

            res.status(200).json({ message: "Tickets fetched successfully", data });
        } catch (error) {
            console.error("getUserTickets error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // Get a single ticket
    getTicket: async (req: Request, res: Response) => {
        try {
            const { ticketId } = req.params;
            const userId = res.locals.userId;
            const userRole = res.locals.userRole;

            const ticket = await SupportTicket.findByPk(ticketId);
            if (!ticket) return res.status(404).json({ message: "Ticket not found" });

            if (userRole !== "super_admin" && userRole !== "sub_admin" && String(ticket.userId) !== String(userId)) {
                return res.status(403).json({ message: "Unauthorized access" });
            }

            const user = await User.findByPk(ticket.userId);
            const data = {
                _id: String(ticket.id),
                user: { _id: String(ticket.userId), name: user?.name || "Unknown", email: user?.email || "" },
                subject: ticket.subject,
                description: ticket.description,
                status: ticket.status,
                priority: ticket.priority,
                category: ticket.category,
                attachments: ticket.attachments || [],
                createdAt: ticket.createdAt,
                updatedAt: ticket.updatedAt,
            };

            res.status(200).json({ message: "Ticket fetched successfully", data });
        } catch (error) {
            console.error("getTicket error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // Update ticket status (admin only)
    updateStatus: async (req: Request, res: Response) => {
        try {
            const { status, ticketId, priority } = req.body;
            if (!ticketId) return res.status(400).json({ message: "ticketId required" });

            const admin = res.locals.user;
            if (admin.role !== "super_admin" && admin.role !== "sub_admin") {
                return res.status(403).json({ message: "Unauthorized access" });
            }

            const ticket = await SupportTicket.findByPk(ticketId);
            if (!ticket) return res.status(404).json({ message: "Ticket not found" });

            if (!ticket.assignedTo) ticket.assignedTo = admin.id;
            if (status) ticket.status = status;
            if (priority) ticket.priority = priority;
            await ticket.save();

            try {
                const user = await User.findByPk(ticket.userId);
                if (user) {
                    const message = `Your support ticket status has been updated:<br>Subject: ${ticket.subject}<br>New Status: ${status}<br>Assigned To: ${admin.name}`;
                    await sendEmail(user.email, "Support Ticket Status Updated", user.name, message);
                }
            } catch (emailErr) {
                console.error("Failed to send status update email:", emailErr);
            }

            res.status(200).json({ message: "Ticket status updated successfully" });
        } catch (error) {
            console.error("updateStatus error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    // Get all tickets (admin only)
    getAllTickets: async (req: Request, res: Response) => {
        try {
            const { status, priority, category } = req.query;
            const where: any = {};
            if (status) where.status = status;
            if (priority) where.priority = priority;
            if (category) where.category = category;

            const tickets = await SupportTicket.findAll({
                where,
                order: [["createdAt", "DESC"]],
            });

            // Fetch all unique user IDs and batch-load users
            const userIds = [...new Set(tickets.map(t => t.userId))];
            const users = await User.findAll({ where: { id: userIds } });
            const userMap = new Map(users.map(u => [u.id, u]));

            const data = tickets.map(t => {
                const user = userMap.get(t.userId);
                return {
                    _id: String(t.id),
                    user: { _id: String(t.userId), name: user?.name || "Unknown", email: user?.email || "" },
                    subject: t.subject,
                    description: t.description,
                    status: t.status,
                    priority: t.priority,
                    category: t.category,
                    attachments: t.attachments || [],
                    createdAt: t.createdAt,
                    updatedAt: t.updatedAt,
                };
            });

            res.status(200).json({ message: "Tickets fetched successfully", data });
        } catch (error) {
            console.error("getAllTickets error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
};
