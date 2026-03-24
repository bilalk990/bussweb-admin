import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { connectToDatabase } from "./config/database";
import authRoutes from "./routes/auth_routes";
import superAdminRoutes from "./routes/super_admin_routes";
import userRoutes from "./routes/user_routes";
import subCompanyRoutes from "./routes/sub_company_routes";
import staffRoutes from "./routes/staff_routes";
import { setupSocket } from "./config/socket";
import driverRoutes from "./routes/driver_routes";
import dashboardRoutes from "./routes/dashboard_routes";
import paypalRoutes from "./routes/paypal_routes";
import supportTicketRoutes from "./routes/support_ticket_routes";
import companyAnalyticsRoutes from "./routes/company_analytics_routes";


dotenv.config();

const app = express();
const port = process.env.PORT || 8080;


app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.LOCAL,
      process.env.LOCAL2,
      process.env.ORIGIN,
      'https://bussweb-admin-production.up.railway.app',
      'https://bussadmin-frontend.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174'
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', "PATCH"],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());
app.use(morgan('dev'));

connectToDatabase();

// Serve uploaded files locally with CORS enabled
app.use('/uploads', cors(), express.static(path.join(process.cwd(), 'public', 'uploads')));

// Temporary: Serve backend only for now
console.log('Serving backend API only');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FastBuss Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API routes first
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/super-admin', superAdminRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/sub-company', subCompanyRoutes);
app.use('/api/v1/sub-company/staff', staffRoutes);
app.use('/api/v1/driver', driverRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/paypal', paypalRoutes);
app.use('/api/v1/support', supportTicketRoutes);
app.use('/api/v1/analytics', companyAnalyticsRoutes);

// API-only catch-all
app.get('*', (req, res) => {
  res.status(404).json({
    message: 'API endpoint not found',
    availableEndpoints: {
      health: '/health',
      setupAdmin: '/api/v1/auth/setup-admin',
      login: '/api/v1/auth/login'
    }
  });
});

const server = http.createServer(app);
setupSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});