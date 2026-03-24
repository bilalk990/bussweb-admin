import bcrypt from 'bcryptjs';
import { sequelize } from './src/config/database';
import User from './src/models/user_model';

async function createSuperAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        // Check if super admin already exists
        const existingAdmin = await User.findOne({
            where: { email: 'admin@fastbuss.com' }
        });

        if (existingAdmin) {
            console.log('Super admin already exists!');
            console.log('Email:', existingAdmin.email);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create super admin
        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@fastbuss.com',
            password: hashedPassword,
            role: 'super_admin',
            status: 'active',
            phone: '1234567890'
        });

        console.log('✅ Super admin created successfully!');
        console.log('Email: admin@fastbuss.com');
        console.log('Password: admin123');
        console.log('Role:', admin.role);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating super admin:', error);
        process.exit(1);
    }
}

createSuperAdmin();
