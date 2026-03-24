import { Request, Response } from "express";
import { sequelize } from "../config/database";
import BusAgency from "../models/bus_agency_model";
import Bus from "../models/bus_model";
import Route from "../models/route_model";
import Booking from "../models/booking_model";
import Trip from "../models/trip_model";
import User from "../models/user_model";
import { Op, QueryTypes } from "sequelize";

export const companyAnalyticsController = {
  
  // Get all companies with basic stats
  getAllCompaniesWithStats: async (req: Request, res: Response) => {
    try {
      const companies = await BusAgency.findAll({
        attributes: ['id', 'agencyName', 'logo', 'contactEmail', 'contactPhone', 'isActive', 'createdAt']
      });

      const companiesWithStats = await Promise.all(
        companies.map(async (company) => {
          const [busCount, routeCount, driverCount, bookingStats] = await Promise.all([
            Bus.count({ where: { agencyId: company.id } }),
            Route.count({ where: { agencyId: company.id } }),
            User.count({ where: { agencyId: company.id, role: 'driver' } }),
            sequelize.query(
              `SELECT 
                COUNT(*) as totalBookings,
                SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmedBookings,
                SUM(CASE WHEN status = 'confirmed' THEN total_amount ELSE 0 END) as totalRevenue
              FROM bus_bookings bb
              JOIN bus_schedules bs ON bb.schedule_id = bs.id
              JOIN buses b ON bs.bus_id = b.id
              WHERE b.agency_id = ?`,
              {
                replacements: [company.id],
                type: QueryTypes.SELECT
              }
            )
          ]);

          const stats = bookingStats[0] as any;

          return {
            id: company.id,
            agencyName: company.agencyName,
            logo: company.logo,
            contactEmail: company.contactEmail,
            contactPhone: company.contactPhone,
            isActive: company.isActive,
            createdAt: company.createdAt,
            stats: {
              buses: busCount,
              routes: routeCount,
              drivers: driverCount,
              totalBookings: parseInt(stats.totalBookings) || 0,
              confirmedBookings: parseInt(stats.confirmedBookings) || 0,
              totalRevenue: parseFloat(stats.totalRevenue) || 0
            }
          };
        })
      );

      res.status(200).json({
        message: "Companies fetched successfully",
        data: companiesWithStats
      });
    } catch (error) {
      console.error("Error fetching companies with stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get detailed analytics for a specific company
  getCompanyDetailedAnalytics: async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }

      const company = await BusAgency.findByPk(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      // Get buses with booking stats
      const busesWithStats = await sequelize.query(
        `SELECT 
          b.id,
          b.name as busName,
          b.plate_number as plateNumber,
          b.bus_type as busType,
          b.total_seats as capacity,
          b.status,
          COUNT(DISTINCT bb.id) as totalBookings,
          SUM(CASE WHEN bb.status = 'confirmed' THEN 1 ELSE 0 END) as confirmedBookings,
          SUM(CASE WHEN bb.status = 'pending' THEN 1 ELSE 0 END) as pendingBookings,
          SUM(CASE WHEN bb.status = 'cancelled' THEN 1 ELSE 0 END) as cancelledBookings,
          SUM(CASE WHEN bb.status = 'confirmed' THEN bb.total_amount ELSE 0 END) as totalRevenue,
          COUNT(DISTINCT bs.id) as totalTrips,
          SUM(CASE WHEN bs.status = 'completed' THEN 1 ELSE 0 END) as completedTrips,
          SUM(CASE WHEN bs.status = 'scheduled' THEN 1 ELSE 0 END) as scheduledTrips
        FROM buses b
        LEFT JOIN bus_schedules bs ON b.id = bs.bus_id
        LEFT JOIN bus_bookings bb ON bs.id = bb.schedule_id
        WHERE b.agency_id = ?
        GROUP BY b.id
        ORDER BY totalBookings DESC`,
        {
          replacements: [companyId],
          type: QueryTypes.SELECT
        }
      );

      // Get route performance
      const routePerformance = await sequelize.query(
        `SELECT 
          r.id,
          r.route_name as routeName,
          r.origin,
          r.destination,
          r.distance,
          r.adult_price as adultPrice,
          r.status,
          COUNT(DISTINCT bb.id) as totalBookings,
          SUM(CASE WHEN bb.status = 'confirmed' THEN bb.total_amount ELSE 0 END) as totalRevenue,
          COUNT(DISTINCT bs.id) as totalTrips
        FROM bus_routes r
        LEFT JOIN bus_schedules bs ON r.id = bs.route_id
        LEFT JOIN bus_bookings bb ON bs.id = bb.schedule_id
        WHERE r.agency_id = ?
        GROUP BY r.id
        ORDER BY totalBookings DESC`,
        {
          replacements: [companyId],
          type: QueryTypes.SELECT
        }
      );

      // Get driver stats
      const driverStats = await sequelize.query(
        `SELECT 
          u.id,
          u.name as driverName,
          u.email,
          u.phone,
          u.status,
          b.id as busId,
          b.name as busName,
          b.plate_number as busPlate,
          COUNT(DISTINCT bs.id) as totalTrips,
          SUM(CASE WHEN bs.status = 'completed' THEN 1 ELSE 0 END) as completedTrips
        FROM users u
        LEFT JOIN buses b ON u.assigned_bus_id = b.id
        LEFT JOIN bus_schedules bs ON b.id = bs.bus_id
        WHERE u.agency_id = ? AND u.role = 'driver'
        GROUP BY u.id
        ORDER BY completedTrips DESC`,
        {
          replacements: [companyId],
          type: QueryTypes.SELECT
        }
      );

      // Get booking trends (last 30 days)
      const bookingTrends = await sequelize.query(
        `SELECT 
          DATE(bb.created_at) as date,
          COUNT(*) as bookings,
          SUM(CASE WHEN bb.status = 'confirmed' THEN bb.total_amount ELSE 0 END) as revenue
        FROM bus_bookings bb
        JOIN bus_schedules bs ON bb.schedule_id = bs.id
        JOIN buses b ON bs.bus_id = b.id
        WHERE b.agency_id = ? 
          AND bb.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(bb.created_at)
        ORDER BY date DESC`,
        {
          replacements: [companyId],
          type: QueryTypes.SELECT
        }
      );

      // Get overall stats
      const overallStats = await sequelize.query(
        `SELECT 
          COUNT(DISTINCT b.id) as totalBuses,
          COUNT(DISTINCT CASE WHEN b.status = 'active' THEN b.id END) as activeBuses,
          COUNT(DISTINCT r.id) as totalRoutes,
          COUNT(DISTINCT CASE WHEN r.status = 'active' THEN r.id END) as activeRoutes,
          COUNT(DISTINCT u.id) as totalDrivers,
          COUNT(DISTINCT CASE WHEN u.status = 'active' THEN u.id END) as activeDrivers,
          COUNT(DISTINCT bb.id) as totalBookings,
          SUM(CASE WHEN bb.status = 'confirmed' THEN 1 ELSE 0 END) as confirmedBookings,
          SUM(CASE WHEN bb.status = 'pending' THEN 1 ELSE 0 END) as pendingBookings,
          SUM(CASE WHEN bb.status = 'cancelled' THEN 1 ELSE 0 END) as cancelledBookings,
          SUM(CASE WHEN bb.status = 'confirmed' THEN bb.total_amount ELSE 0 END) as totalRevenue,
          COUNT(DISTINCT bs.id) as totalTrips,
          SUM(CASE WHEN bs.status = 'completed' THEN 1 ELSE 0 END) as completedTrips,
          SUM(CASE WHEN bs.status = 'scheduled' THEN 1 ELSE 0 END) as scheduledTrips
        FROM buses b
        LEFT JOIN bus_routes r ON b.agency_id = r.agency_id
        LEFT JOIN users u ON b.agency_id = u.agency_id AND u.role = 'driver'
        LEFT JOIN bus_schedules bs ON b.id = bs.bus_id
        LEFT JOIN bus_bookings bb ON bs.id = bb.schedule_id
        WHERE b.agency_id = ?`,
        {
          replacements: [companyId],
          type: QueryTypes.SELECT
        }
      );

      res.status(200).json({
        message: "Company analytics fetched successfully",
        data: {
          company: {
            id: company.id,
            agencyName: company.agencyName,
            logo: company.logo,
            contactEmail: company.contactEmail,
            contactPhone: company.contactPhone,
            description: company.description,
            isActive: company.isActive,
            createdAt: company.createdAt
          },
          overallStats: overallStats[0],
          buses: busesWithStats,
          routes: routePerformance,
          drivers: driverStats,
          bookingTrends: bookingTrends
        }
      });
    } catch (error) {
      console.error("Error fetching company analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get bus-specific analytics
  getBusAnalytics: async (req: Request, res: Response) => {
    try {
      const { busId } = req.params;
      const { startDate, endDate } = req.query;

      if (!busId) {
        return res.status(400).json({ message: "Bus ID is required" });
      }

      const bus = await Bus.findByPk(busId);
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }

      let dateFilter = '';
      const replacements: any[] = [busId];

      if (startDate && endDate) {
        dateFilter = 'AND bs.departure_date BETWEEN ? AND ?';
        replacements.push(startDate, endDate);
      }

      // Get detailed booking history
      const bookingHistory = await sequelize.query(
        `SELECT 
          bb.id as bookingId,
          bb.bookingreference as bookingRef,
          bb.status,
          bb.total_amount as amount,
          bb.created_at as bookingDate,
          bs.departure_date as travelDate,
          bs.departure_time as departureTime,
          bs.arrival_time as arrivalTime,
          bs.status as tripStatus,
          r.route_name as routeName,
          r.origin,
          r.destination,
          uc.name as passengerName,
          uc.email as passengerEmail
        FROM bus_bookings bb
        JOIN bus_schedules bs ON bb.schedule_id = bs.id
        JOIN bus_routes r ON bs.route_id = r.id
        LEFT JOIN users_customers uc ON bb.user_id = uc.id
        WHERE bs.bus_id = ? ${dateFilter}
        ORDER BY bs.departure_date DESC, bs.departure_time DESC
        LIMIT 100`,
        {
          replacements,
          type: QueryTypes.SELECT
        }
      );

      // Get trip completion stats
      const tripStats = await sequelize.query(
        `SELECT 
          COUNT(*) as totalTrips,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTrips,
          SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduledTrips,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledTrips
        FROM bus_schedules
        WHERE bus_id = ? ${dateFilter}`,
        {
          replacements,
          type: QueryTypes.SELECT
        }
      );

      res.status(200).json({
        message: "Bus analytics fetched successfully",
        data: {
          bus: {
            id: bus.id,
            name: bus.name,
            plateNumber: bus.plateNumber,
            busType: bus.busType,
            capacity: bus.capacity,
            status: bus.status
          },
          tripStats: tripStats[0],
          bookingHistory
        }
      });
    } catch (error) {
      console.error("Error fetching bus analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
