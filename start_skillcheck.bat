@echo off
title SkillCheck - Expo Server
color 0A

echo ===================================================
echo        SkillCheck Expo Server Startup Utility
echo ===================================================
echo.

:: --- STEP 1: DIRECTORY CHECK ---
echo [Step 1/3] Verifying project directory...
if not exist "package.json" (
    color 0C
    echo.
    echo [ERROR] 'package.json' was not found!
    echo Ensure this .bat file is placed directly INSIDE your 'skillcheck' folder.
    echo.
    pause
    exit /b 1
)
echo [OK] Valid project directory detected.
echo.

:: --- STEP 2: DEPENDENCIES ---
echo [Step 2/3] Verifying Node dependencies...

call npm install --no-fund --no-audit --loglevel=error

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Failed to install npm dependencies. Check your internet connection.
    echo.
    pause
    exit /b 1
)

echo Running Expo compatibility check...
call npx expo install --fix

echo [OK] Dependencies are installed and up to date!
echo.

:: --- STEP 3: SERVER START (TUNNEL WITH LOCAL FALLBACK) ---
echo [Step 3/3] Booting up the Expo Metro Bundler...
echo.
echo ==============================================================
echo   *** NOTE ***
echo   Attempting to start via TUNNEL first...
echo   Scan the QR code below with your phone's Camera (iOS) 
echo   or directly inside the Expo Go App (Android/iOS)!
echo ==============================================================
echo.

:: Attempt Tunnel First
call npx expo start --tunnel

:: If Tunnel fails (or if user aborts with Ctrl+C and hits 'N' to terminating batch)
if %ERRORLEVEL% NEQ 0 (
    color 0E
    echo.
    echo ===================================================
    echo [!] Tunnel connection failed or was aborted.
    echo [!] Falling back to standard local network...
    echo ===================================================
    echo.
    color 0A
    
    :: Fallback to local
    call npx expo start
)

color 0E
echo.
echo ===================================================
echo [!] The Expo server has been stopped.
echo ===================================================
pause