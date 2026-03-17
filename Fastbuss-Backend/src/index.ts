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


dotenv.config();

const app = express();
const port = process.env.PORT || 8080;


app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.LOCAL,
      process.env.LOCAL2,
      process.env.ORIGIN,
      'https://bussweb-admin-production.up.railway.app',
      'http://localhost:3000',
      'http://localhost:5173'
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

// Serve React frontend
const frontendPath = path.join(__dirname, 'dist-frontend');
const fallbackPath = path.join(__dirname, '../../FastBuss-Admin/dist');
const fs = require('fs');

let actualFrontendPath = null;
if (fs.existsSync(frontendPath)) {
  actualFrontendPath = frontendPath;
  console.log('Using copied frontend from:', frontendPath);
} else if (fs.existsSync(fallbackPath)) {
  actualFrontendPath = fallbackPath;
  console.log('Using fallback frontend from:', fallbackPath);
} else {
  console.log('No frontend found, serving backend only');
}

console.log('Frontend path check:', {
  frontendPath,
  fallbackPath,
  actualFrontendPath,
  frontendExists: actualFrontendPath ? fs.existsSync(actualFrontendPath) : false
});

// Serve static files if frontend exists
if (actualFrontendPath) {
  app.use(express.static(actualFrontendPath));
  console.log('✅ Serving frontend static files from:', actualFrontendPath);
}

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

// Catch-all handler for React Router
app.get('*', (req, res) => {
  if (actualFrontendPath) {
    const indexPath = path.join(actualFrontendPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ message: 'Frontend index.html not found', path: indexPath });
    }
  } else {
    res.status(404).json({ 
      message: 'Frontend not available', 
      note: 'API endpoints are available at /api/v1/*',
      setupAdmin: '/api/v1/auth/setup-admin'
    });
  }
});

const server = http.createServer(app);
setupSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});