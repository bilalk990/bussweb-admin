const { sequelize } = require('./build/config/database');

async function test() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SHOW COLUMNS FROM users");
        console.log("USERS COLUMNS:");
        console.table(results);

        // Also let's check super admin credentials
        const [superAdmins] = await sequelize.query("SELECT email, password, role FROM users WHERE role = 'super_admin'");
        console.log("SUPER ADMINS:");
        console.table(superAdmins);

        // Also query the sub_companies structure
        const [subCompaniesColumns] = await sequelize.query("SHOW COLUMNS FROM sub_companies");
        console.log("SUB_COMPANIES COLUMNS:");
        console.table(subCompaniesColumns);
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
test();
