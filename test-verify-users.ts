import { sequelize } from './src/config/database';

async function verifyAllUsers() {
    try {
        await sequelize.authenticate();
        await sequelize.query("UPDATE users SET email_verified_at = NOW() WHERE email_verified_at IS NULL");
        console.log("Verified all users.");
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
verifyAllUsers();
