@echo off
title Firebase Login - BookToTable
cd /d "c:\Users\noamh\BookToTable"
echo.
echo ============================================
echo  Firebase CLI Login for BookToTable
echo ============================================
echo.
echo Step 1: A browser will open automatically.
echo Step 2: Sign in with noamhemo2001@gmail.com
echo Step 3: Click "Allow" for Firebase CLI access
echo Step 4: Copy the authorization code shown
echo Step 5: Paste it here and press Enter
echo.
firebase login --interactive
echo.
echo.
if %errorlevel% == 0 (
  echo SUCCESS! Now deploying security rules...
  echo.
  firebase use booktotable-ff026
  firebase deploy --only firestore:rules,storage
  echo.
  echo ============================================
  echo  DONE! Firebase rules deployed successfully!
  echo ============================================
) else (
  echo Login failed. Please try again.
)
echo.
pause
