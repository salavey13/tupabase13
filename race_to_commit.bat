@echo off
:: SUPER LAZY RACE SCRIPT WITH PULL REQUEST & FIRST COMMIT MSG SUPPORT

:: Config Variables
set REPO_URL=https://github.com/salavey13/tupabase13
set GIT_INSTALLER_URL=https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.1/Git-2.42.0-64-bit.exe
set REPO_DIR=%USERPROFILE%\Documents\projects\tupabase13
set DEFAULT_AI_URL=https://bolt.new/~/bolt-nextjs-shadcn-pkcsgc

:: Welcome Message
echo ============================================
echo 🏁 Welcome to the Great Commit Race! 🏁
echo ============================================
echo Lazy mode ON: Let’s make your mark in coding history.

:: Check Git Installation
echo 🔍 Checking for Git...
git --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 🛠️ Git is not installed. Installing silently...
    curl -L -o git_installer.exe %GIT_INSTALLER_URL%
    start /wait git_installer.exe /SILENT
    del git_installer.exe
    echo 🔄 Git installed! Restarting the script...
    start "" "%~f0"
    exit /b
)

:: Check for Project Folder
if not exist "%REPO_DIR%" (
    echo 🛠️ Project not found locally. Cloning the repo...
    git clone %REPO_URL% "%REPO_DIR%"
    echo ✅ Repo cloned. Let’s continue!
) else (
    echo Repo found! Skipping clone.
)

cd "%REPO_DIR%"

:: Check for First Commit Race Condition
if not exist "lib" (
    set RACE_WINNER=1
) else (
    set RACE_WINNER=0
)

:: Detect Existing VERSION File
if exist "VERSION" (
    for /f "tokens=1" %%v in ('type VERSION') do set CURRENT_VERSION=%%v
    echo Current project version: %CURRENT_VERSION%
) else (
    set CURRENT_VERSION=0
    echo 0 > VERSION
)

:: Detect ZIP Files
echo 🔍 Searching for ZIP files...
setlocal enabledelayedexpansion
set ZIP_COUNT=0
set LATEST_ZIP=
set ZIP_FILES=

for %%f in ("%REPO_DIR%\*.zip") do (
    set /a ZIP_COUNT+=1
    set LATEST_ZIP=%%~nxf
    set ZIP_FILES=!ZIP_FILES! %%~nxf
)

:: Check for Loneliness or Present ZIPs
if %ZIP_COUNT% equ 1 (
    if %RACE_WINNER% equ 0 (
        echo ⚠️ Only one ZIP found, and it’s already applied.
        echo 🔄 PUT YOUR NEW ZIP HERE: "%REPO_DIR%"
        echo 🔄 Then restart this script.
        pause
        explorer "%REPO_DIR%"
        exit /b
    )
) else if %ZIP_COUNT% gtr 1 (
    echo Multiple ZIPs detected. Select one to apply:
    set /a i=1
    for %%f in (%ZIP_FILES%) do (
        echo [!i!] %%~f
        set "ZIP_!i!=%%~f"
        set /a i+=1
    )
    set /p ZIP_CHOICE="Enter the number of the ZIP to use (default: latest): "
    if not defined ZIP_CHOICE set ZIP_CHOICE=%ZIP_COUNT%
    for /f "tokens=%ZIP_CHOICE%" %%f in ("%ZIP_FILES%") do set LATEST_ZIP=%%f
)

:: Check VERSION File to Skip Already Applied ZIPs
findstr /c:"%LATEST_ZIP%" VERSION >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo 🔄 Archive "%LATEST_ZIP%" is already applied. Please add a new ZIP.
    pause
    exit /b
)

:: Extract ZIP
echo 🛠️ Applying your work from "%LATEST_ZIP%"...
powershell -Command "Expand-Archive -Force '%REPO_DIR%\%LATEST_ZIP%' -DestinationPath .\temp_unzip"
for /d %%d in (temp_unzip\*) do set ROOT_UNPACKED_DIR=%%d
xcopy /s /y "!ROOT_UNPACKED_DIR!\*" "%REPO_DIR%"
rmdir /s /q temp_unzip

:: Update VERSION File
set /a NEXT_VERSION=%CURRENT_VERSION%+1
echo %NEXT_VERSION% %LATEST_ZIP% %DEFAULT_AI_URL% >> VERSION

:: Use Default AI URL for First Commit
if %RACE_WINNER% equ 1 (
    echo ============================================
    echo 🎉 You’re the WINNER of the Race! Eternal Glory is yours! 🎉
    echo ============================================
    echo Please write a legendary first commit message:
    set /p COMMIT_MSG="Your first commit message: "
) else (
    set COMMIT_MSG="💥 Applied updates from %LATEST_ZIP% | Version %NEXT_VERSION% | AI Tool: %DEFAULT_AI_URL%"
    echo ✅ You’ve successfully contributed. Great job!
)

:: Create New Branch and Commit
set BRANCH_NAME=contributor_%DATE:~-4%%DATE:~-7,2%%DATE:~-10,2%_%TIME:~0,2%%TIME:~3,2%
git checkout -b %BRANCH_NAME%
git add .
git commit -m "%COMMIT_MSG%"

:: Push Changes and Return to Main
git push origin %BRANCH_NAME%
git checkout main
git pull origin main

:: Open Pull Request Page in Browser
echo Opening GitHub Pull Request page in your default browser...
start "" "https://github.com/salavey13/tupabase13/pulls"

:: Finish Message
echo ============================================
echo ✅ All done! Your work is live on a new branch.
echo 🌟 Don’t forget to create a Pull Request! 🌟
echo ============================================
echo 1. Go to the opened GitHub Pull Request page.
echo 2. Click "New Pull Request."
echo 3. Select your branch (%BRANCH_NAME%) and create the PR.
pause
