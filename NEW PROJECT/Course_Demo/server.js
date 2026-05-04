const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const path = require('path');
const sql = require('mssql');

const app = express();
const port = process.env.PORT || 3000; 
const CLIENT_ID = '826098872175-uvv1odj4podc0dvhpp5oe5rk2u01nnk8.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

app.use(express.json());
app.use(express.static(__dirname));

// ---------------------------------------------------------
// Azure MS SQL 資料庫連線配置
// ---------------------------------------------------------
const dbConfig = {
    user: 'blackge990780',
    password: 'Zxcvbnm,./-',
    server: 'kjsim6.database.windows.net',
    database: 'KJCRM',
    options: {
        encrypt: true, // Azure 強制要求加密
        trustServerCertificate: false 
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// 建立全域連線池
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('✅ 成功連線至 Azure MS SQL 資料庫 (KJCRM)');
    return pool;
  })
  .catch(err => console.error('資料庫連線失敗！', err));

// 驗證 JWT Token
async function verifyUser(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });
    return ticket.getPayload();
}

// ---------------------------------------------------------
// [一般學員區 API] - 傳統帳號密碼登入與真實資料庫核對
// ---------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
    try {
        const { userId, password } = req.body;
        const pool = await poolPromise;
        
        // 透過參數化查詢防範 SQL Injection
        // 【注意】因為目前的 tblWebUser 資料表沒有 Password 欄位，這裡暫時只驗證帳號存在與否
        // （修正：避免將 Email 字串跟數值型態的 userID 混著比較）
        const userResult = await pool.request()
            .input('userId', sql.NVarChar, userId)
            .query(`SELECT userID, isAdmin FROM tblWebUser WHERE email = @userId`);
            
        if (userResult.recordset.length === 0) {
            console.log(`[登入失敗] 帳號或密碼錯誤: ${userId}`);
            return res.status(401).json({ success: false, error: "帳號或密碼錯誤" });
        }
        
        const dbUserID = userResult.recordset[0].userID;

        // 從資料庫 tblWebUserCourseAccess 查詢他買了哪些課
        const accessResult = await pool.request()
            .input('userID', sql.Int, dbUserID)
            .query(`SELECT courseID FROM tblWebUserCourseAccess WHERE userID = @userID`);
            
        // 將資料庫的 1, 2, 3 轉換成前端的 course_1, course_2, course_3
        const permitted_courses = accessResult.recordset.map(row => `course_${row.courseID}`);

        console.log(`[傳統登入成功] 帳號 ${userId} 通行證:`, permitted_courses);
        res.json({ success: true, userId: userId, permitted_courses: permitted_courses });

    } catch (error) {
        console.error("登入資料庫查詢失敗:", error);
        res.status(500).json({ success: false, error: "資料庫異常" });
    }
});


// ---------------------------------------------------------
// [Dacast 影音防盜區 API] - 產生限時 5 分鐘的動態加密網址
// ---------------------------------------------------------
const crypto = require('crypto');
const DACAST_API_KEY = "17770147498545eNe7EuuAmx8vtmvqd5O7tDOblZad"; // 您的專屬金鑰

app.post('/api/getSecureVideoUrl', async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        
        if (!userId || !courseId) {
            return res.status(400).json({ success: false, error: "缺少必要參數" });
        }

        // TODO: 真實營運時，這裡應該去 SQL 檢查該學員是否真的有買這堂課，防止駭客硬猜！
        // const hasPermission = await checkUserPermissionInSQL(userId, courseId); ...

        // 1. 設定 5 分鐘後過期的時間戳記 (Unix Timestamp in seconds)
        const expires = Math.floor(Date.now() / 1000) + (5 * 60);

        // 2. 根據點擊的課程，對應到您真實的 Dacast 影片 ID
        let dacastVideoId = "e65adbfa-b579-e2bb-919a-170b0d562a65/91c12faf-0dc4-4b50-9269-019d05d4654b"; // 預設第一支
        if (courseId == 1) {
            dacastVideoId = "e65adbfa-b579-e2bb-919a-170b0d562a65/91c12faf-0dc4-4b50-9269-019d05d4654b";
        } else if (courseId == 4) {
            dacastVideoId = "e65adbfa-b579-e2bb-919a-170b0d562a65/91132b76-a6d4-4a4f-8146-cd04439ae881";
        } else if (courseId == 5) {
            dacastVideoId = "e65adbfa-b579-e2bb-919a-170b0d562a65/2a80f859-e62c-4e0a-9a89-543dbd3668fd";
        }
        
        // 3. 利用 HMAC-SHA256 演算法與您的專屬金鑰進行高強度加密
        // 將「影片ID + 學員ID + 過期時間」一起打散揉成無法逆向破解的 Token
        const messageToSign = `${dacastVideoId}:${userId}:${expires}`;
        const signature = crypto.createHmac('sha256', DACAST_API_KEY).update(messageToSign).digest('hex');

        // 4. 組合出這張獨一無二的專屬播放票券
        // (如果 Dacast 後台還沒開啟防盜鎖，這串 token 會自動被忽略並正常播放)
        const secureUrl = `https://iframe.dacast.com/vod/${dacastVideoId}?token=${signature}&expires=${expires}`;

        console.log(`[Dacast 售票亭] 成功核發 5 分鐘票券給 ${userId} 觀看 ${courseId}`);
        console.log(`🎫 票券網址: ${secureUrl}`);

        res.json({ success: true, secureUrl: secureUrl });

    } catch (error) {
        console.error("生成加密網址失敗:", error);
        res.status(500).json({ success: false, error: "伺服器錯誤" });
    }
});


// ---------------------------------------------------------
// [HR 後台區 API] - 串聯真實資料庫的管理介面
// ---------------------------------------------------------
app.post('/api/admin/get_users', async (req, res) => {
    try {
        const payload = await verifyUser(req.body.token);
        const adminEmail = payload.email.toLowerCase();

        const pool = await poolPromise;
        // 防駭客：去資料庫檢查這個人到底是不是 isAdmin = 1
        const adminCheck = await pool.request()
            .input('email', sql.VarChar, adminEmail)
            .query(`SELECT isAdmin FROM tblWebUser WHERE email = @email`);
            
        if (adminCheck.recordset.length === 0 || !adminCheck.recordset[0].isAdmin) {
            return res.status(403).json({ error: "您在資料庫中不具備人事管理員權限 (isAdmin != 1)" });
        }

        // 撈出全公司所有學員與他們的課程
        const users = await pool.request().query(`SELECT email FROM tblWebUser`);
        const result = await pool.request().query(`
            SELECT u.email, a.courseID 
            FROM tblWebUser u
            JOIN tblWebUserCourseAccess a ON u.userID = a.userID
        `);

        // 轉換格式給前端 Table 顯示
        let adminData = {};
        users.recordset.forEach(u => adminData[u.email] = []); // 先全部給空陣列
        result.recordset.forEach(row => {
            adminData[row.email].push(`course_${row.courseID}`);
        });

        res.json(adminData);
    } catch(e) {
        res.status(401).json({ error: "憑證無效" });
    }
});

app.post('/api/admin/update_user', async (req, res) => {
    try {
        const payload = await verifyUser(req.body.token);
        const adminEmail = payload.email.toLowerCase();

        const pool = await poolPromise;
        const adminCheck = await pool.request()
            .input('email', sql.VarChar, adminEmail)
            .query(`SELECT isAdmin FROM tblWebUser WHERE email = @email`);
            
        if (adminCheck.recordset.length === 0 || !adminCheck.recordset[0].isAdmin) {
            return res.status(403).json({ error: "拒絕存取" });
        }
        
        const { targetEmail, newCourses } = req.body; // newCourses 會是 ["course_1", "course_3"] 等
        
        // 找出要被修改的倒楣鬼的 userID
        const targetCheck = await pool.request()
            .input('email', sql.VarChar, targetEmail)
            .query(`SELECT userID FROM tblWebUser WHERE email = @email`);
            
        if (targetCheck.recordset.length === 0) {
             return res.status(404).json({ error: "找不到該名學員" });
        }
        const targetUserID = targetCheck.recordset[0].userID;

        // 啟動資料庫交易 (Transaction)，確保刪除舊權限跟新增新權限一氣呵成！
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        
        try {
            const request = new sql.Request(transaction);
            // 步驟一：把這個學員的所有課程全部砍掉重練
            await request
                .input('userID', sql.Int, targetUserID)
                .query(`DELETE FROM tblWebUserCourseAccess WHERE userID = @userID`);
                
            // 步驟二：根據後台打勾勾的內容，一條一條重新寫進去
            for (const cStr of newCourses) {
                // 將 "course_2" 轉回數字 2
                const cID = parseInt(cStr.replace('course_', '')); 
                if (cID > 0) {
                    const insertReq = new sql.Request(transaction);
                    await insertReq
                        .input('userID', sql.Int, targetUserID)
                        .input('courseID', sql.Int, cID)
                        .query(`INSERT INTO tblWebUserCourseAccess (userID, courseID, grantedAt) VALUES (@userID, @courseID, GETDATE())`);
                }
            }
            
            await transaction.commit(); // 確定提交變更
            console.log(`[SQL 修改] 已將 ${targetEmail} 的權限變更為: ${newCourses}`);
            res.json({ success: true });
            
        } catch (err) {
            await transaction.rollback(); // 發生錯誤就還原
            throw err;
        }
        
    } catch(e) {
        console.error(e);
        res.status(401).json({ error: "憑證無效" });
    }
});

// ---------------------------------------------------------
// 頁面路由配置
// ---------------------------------------------------------
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Course backend listening on port ${port}`);
});
