// Quick script to create a super admin user
// Run with: node create-admin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Update this with your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fastbuss';

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    is_email_verified: Boolean,
    status: String
});

const User = mongoose.model('User', userSchema);

async function createSuperAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'admin@fastbuss.com';
        const password = 'Admin@123';
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log('⚠️  Admin already exists with email:', email);
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin
        const admin = new User({
            name: 'Super Admin',
            email: email,
            password: hashedPassword,
            role: 'super_admin',
            is_email_verified: true,
            status: 'active'
        });

        await admin.save();
        
        console.log('✅ Super Admin created successfully!');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('\n⚠️  Please change the password after first login!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createSuperAdmin();
