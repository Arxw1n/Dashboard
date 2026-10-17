@echo off
cd /d "%~dp0"
echo ======================================================
echo   Pushing Live Welcomer & Image Studio Fix to Vercel
echo ======================================================
echo.
git push origin main
echo.
echo ======================================================
echo   [DONE] Pushed to GitHub! 
echo   Vercel is now deploying your updated dashboard.
echo ======================================================
pause
