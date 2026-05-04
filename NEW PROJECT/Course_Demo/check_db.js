const sql = require('mssql');

const config = {
    user: 'blackge990780',
    password: 'Zxcvbnm,./-',
    server: 'kjsim6.database.windows.net',
    database: 'KJCRM',
    options: {
        encrypt: true,
        trustServerCertificate: false 
    }
};

async function check() {
    try {
        await sql.connect(config);
        const userSchema = await sql.query("SELECT COLUMN_NAME, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tblWebUser'");
        console.table(userSchema.recordset);
    } catch (err) {
        console.error(err);
    } finally {
        sql.close();
    }
}
check();
