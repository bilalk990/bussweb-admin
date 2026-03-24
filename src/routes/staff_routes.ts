import express from "express";
import tokenValidationMiddleware from "../middlewares/token_validator";
import statusChecker from "../middlewares/status_checker";
import { roleMiddleware } from "../middlewares/role_middleware";
import { busAgencyController } from "../controllers/bus_agency_controller";
import { userController } from "../controllers/user_controller";

const router = express.Router();

router.use(tokenValidationMiddleware);
router.use(statusChecker);
router.use(roleMiddleware(["super_admin", "sub_admin", "staff"]));


// Bus Management - View Only
router.get("/buses", busAgencyController.getMyBuses);
router.get("/available-buses", busAgencyController.getAvailableBuses);
router.get("/active-trips", busAgencyController.getAllActiveTrips);
router.get("/bus-details/:busId", busAgencyController.busDetails);

// Driver Management - View Only
router.get("/drivers", busAgencyController.getMyDrivers);
router.get("/get-trip-history-by-driver/:driverId", busAgencyController.getTripHistoryByDriver);
router.get("/available-drivers", busAgencyController.getAvailableDrivers);
router.get("/driver-schedules/:driverId", busAgencyController.getDriverSchedules);
router.get("/no-driver-buses", busAgencyController.noDriverBuses);

// Route Management - View Only
router.get("/all-routes", busAgencyController.getAllRoutesBySubCompany);

// Company Profile - View Only
router.get("/company-profile", busAgencyController.getCompanyProfile);

// Trip Management - View Only
router.get("/get-all-schedules", busAgencyController.getAllSchedules);
router.get("/get-trip-history", busAgencyController.getTripHistory);
router.get("/get-trip-details/:tripId", busAgencyController.getTripDetails);
router.get("/get-trip-history-by-bus/:busId", busAgencyController.getTripHistoryByBus);
router.get("/get-trip-history-by-sub-company", busAgencyController.getTripHistoryBySubCompany);

// Booking Management - View Only
router.get("/bookings", busAgencyController.getBookings);
router.get("/bookings/bus-summary", busAgencyController.getBookingsBusSummary);

// Notification Management - View Only
router.get("/send-bulk-notification", busAgencyController.sendBulkNotification);

// User Management - View Only
router.get("/get-admin-details", userController.getProfile);







export default router; 