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
const port = process.env.PORT || 5000;


app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.LOCAL,
      process.env.LOCAL2,
      process.env.ORIGIN,
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
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
const frontendPath = path.join(__dirname, '../../FastBuss-Admin/dist');
const fs = require('fs');
console.log('Checking frontend path:', frontendPath);
console.log('Frontend exists:', fs.existsSync(frontendPath));

// Serve static files
app.use(express.static(frontendPath));

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
  const indexPath = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ message: 'Frontend not built', path: frontendPath });
  }
});

const server = http.createServer(app);
setupSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});