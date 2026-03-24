import express from "express";
import tokenValidationMiddleware from "../middlewares/token_validator";
import statusChecker from "../middlewares/status_checker";
import { roleMiddleware } from "../middlewares/role_middleware";
import { companyAnalyticsController } from "../controllers/company_analytics_controller";

const router = express.Router();

// All routes require authentication and super_admin role
router.use(tokenValidationMiddleware);
router.use(statusChecker);
router.use(roleMiddleware(["super_admin"]));

// Get all companies with basic stats
router.get("/companies", companyAnalyticsController.getAllCompaniesWithStats);

// Get detailed analytics for a specific company
router.get("/company/:companyId", companyAnalyticsController.getCompanyDetailedAnalytics);

// Get bus-specific analytics
router.get("/bus/:busId", companyAnalyticsController.getBusAnalytics);

export default router;
