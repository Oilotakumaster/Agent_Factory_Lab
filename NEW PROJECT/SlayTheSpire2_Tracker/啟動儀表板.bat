@echo off
echo 啟動殺戮尖塔2 統計儀表板...
cd /d "D:\agent_factory\NEW PROJECT\SlayTheSpire2_Tracker"

REM 自動打開瀏覽器前往儀表板
start http://127.0.0.1:5000

REM 啟動伺服器
python server.py

pause
