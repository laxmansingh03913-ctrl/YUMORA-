@echo off
title Yumora Quick Deploy
cls
echo ===================================================
echo   YOMIKA / YUMORA - ONE-CLICK AUTO DEPLOY
echo ===================================================
echo.
echo [1/3] Staging changes...
git add .
echo [2/3] Committing updates...
git commit -m "chore: auto update site" --allow-empty
echo [3/3] Pushing to GitHub & triggering Vercel build...
git push origin main
echo.
echo ===================================================
echo   DEPLOYMENT TRIGGERED SUCCESSFULLY!
echo   Vercel is now building and deploying your site.
echo ===================================================
echo.
pause
