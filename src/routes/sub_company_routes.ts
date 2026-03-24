import express from "express";
import tokenValidationMiddleware from "../middlewares/token_validator";
import statusChecker from "../middlewares/status_checker";
import { roleMiddleware } from "../middlewares/role_middleware";
import { busAgencyController } from "../controllers/bus_agency_controller";
import { uploadImage } from "../middlewares/upload_middleware";
import { staffOperationMiddleware } from "../middlewares/staff_logger_middleware";

const router = express.Router();

router.use(tokenValidationMiddleware);
router.use(statusChecker);
router.use(roleMiddleware(["sub_admin", "super_admin"]));



// Bus Management
router.post("/create-bus", busAgencyController.createBus);
router.put("/deactivate-bus/:busId", busAgencyController.deactivateBus);
router.put("/activate-bus/:busId", busAgencyController.activateBus);
router.put("/bus-maintenance/:busId", busAgencyController.busMaintenance);
router.put("/bus-back-from-maintenance/:busId", busAgencyController.busBackFromMaintenance);
router.delete("/delete-bus/:busId", busAgencyController.deleteBus);

// Driver Management
router.post("/create-driver", busAgencyController.createDriver);
router.put("/update-driver/:driverId", busAgencyController.updateDriver);
router.put("/ban-driver/:driverId", busAgencyController.banDriver);
router.put("/unban-driver/:driverId", busAgencyController.unbanDriver);
router.delete("/delete-driver/:driverId", busAgencyController.deleteDriver);
router.put("/assign-driver-to-bus", busAgencyController.assignDriverToBus);
router.put("/unassign-driver-from-bus", busAgencyController.unassignDriverFromBus);
router.get("/get-all-drivers-with-no-bus", busAgencyController.getAllDriversWithNoBus);

// Route Management
router.post("/create-route", busAgencyController.createRoute);
router.put("/update-route/:routeId", busAgencyController.updateRoute);
router.post("/create-route-schedule", busAgencyController.createRouteSchedule);
router.put("/change-bus-in-schedule", busAgencyController.changeBusInSchedule);
router.put("/deactivate-route/:routeId", busAgencyController.deactivateRoute);
router.put("/activate-route/:routeId", busAgencyController.activateRoute);
router.delete("/delete-route/:routeId", busAgencyController.deleteRoute);

// Route Stops Management
router.get("/route/:routeId/stops", busAgencyController.getRouteStops);
router.post("/route/:routeId/stops", busAgencyController.addRouteStop);
router.put("/route-stop/:stopId", busAgencyController.updateRouteStop);
router.delete("/route-stop/:stopId", busAgencyController.deleteRouteStop);

// Company Profile Management
router.put("/update-company-profile", uploadImage.single("logo"), busAgencyController.updateCompanyProfile);

// Staff Management
router.post("/create-staff", busAgencyController.createStaff);
router.get("/list-all-staff", busAgencyController.listAllStaff);
router.put("/update-staff/:staffId", busAgencyController.updateStaff);
router.delete("/delete-staff/:staffId", busAgencyController.deleteStaff);
router.put("/block-staff/:staffId", busAgencyController.blockStaff);
router.put("/unblock-staff/:staffId", busAgencyController.unblockStaff);
router.get("/staff-analysis/:staffId", busAgencyController.staffAnalysis);
router.get("/staff-details/:staffId", busAgencyController.staffDetails);


// Trip Management
router.put("/update-trip", busAgencyController.updateTrip);
router.put("/cancel-trip/:tripId", busAgencyController.cancelTrip);


export default router;
