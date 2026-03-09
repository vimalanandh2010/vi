@echo off
cd /d "d:\job portal - Copy - Copy"
echo === Git Add ===
git add backend\utils\meetingGenerator.js backend\routes\jobRoutes.js
echo Exit code: %errorlevel%
echo === Git Status ===
git status
echo === Git Commit ===
git commit -m "Add automatic Jitsi Meet link generation"
echo Exit code: %errorlevel%
echo === Git Push ===
git push
echo Exit code: %errorlevel%
echo === Done ===
