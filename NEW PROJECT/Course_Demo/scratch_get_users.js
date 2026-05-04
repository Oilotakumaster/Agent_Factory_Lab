const sql = require('mssql');
const dbConfig = {
    user: 'blackge990780',
    password: 'Zxcvbnm,./-',
    server: 'kjsim6.database.windows.net',
    database: 'KJCRM',
    options: { encrypt: true, trustServerCertificate: false }
};

sql.connect(dbConfig).then(pool => {
    return pool.request()
        .input('email', sql.NVarChar, 'blackge990780@gmail.com')
        .query('SELECT * FROM tblWebUser WHERE email = @email');
}).then(result => {
    console.log(result.recordset);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
