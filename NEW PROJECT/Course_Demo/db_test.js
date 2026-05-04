const sql = require('mssql');

const config = {
    user: 'blackge990780',
    password: 'Zxcvbnm,./-',
    server: 'kjsim6.database.windows.net',
    database: 'KJCRM',
    options: {
        encrypt: true, // Required for Azure SQL
        trustServerCertificate: false 
    }
};

async function probe() {
    try {
        await sql.connect(config);
        console.log('Connected to MS SQL successfully!');
        
        const userSchema = await sql.query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tblWebUser'");
        console.log("--- tblWebUser Columns ---");
        console.table(userSchema.recordset);

        const accessSchema = await sql.query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tblWebUserCourseAccess'");
        console.log("--- tblWebUserCourseAccess Columns ---");
        console.table(accessSchema.recordset);

    } catch (err) {
        console.error('SQL connection error:', err);
    } finally {
        sql.close();
    }
}

probe();
