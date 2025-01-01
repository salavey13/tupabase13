@echo off
setlocal enabledelayedexpansion

:: Config Variables
set REPO_URL=https://github.com/salavey13/tupabase13
set GIT_INSTALLER_URL=https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.1/Git-2.42.0-64-bit.exe
set REPO_DIR=%USERPROFILE%\Documents\projects\tupabase13
set DEFAULT_AI_URL=https://bolt.new/~/bolt-nextjs-shadcn-pkcsgc

:: Welcome Message
echo ============================================
echo 🏁 Welcome to the Great Commit Race! 🏁
echo ============================================

:: Check Git Installation
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

:: Ensure Repo Directory Exists
if not exist "%REPO_DIR%" (
    echo 🛠️ Cloning repo: %REPO_URL% ...
    git clone %REPO_URL% "%REPO_DIR%" || exit /b
    echo ✅ Repo cloned successfully!
) else (
    echo 📂 Repo found locally. Continuing...
)

:: Navigate to Repo
cd "%REPO_DIR%" || exit /b

:: Detect First Commit Race
if not exist "lib" (
    set RACE_WINNER=1
) else (
    set RACE_WINNER=0
)

:: Detect and Apply Latest ZIP File
set ZIP_FILES=
for %%f in ("%REPO_DIR%\*.zip") do (
    set ZIP_FILES=!ZIP_FILES! "%%~nxf"
)
if "!ZIP_FILES!"=="" (
    echo ⚠️ No ZIP files found. Add your archive to "%REPO_DIR%" and restart the script.
    pause
    exit /b
)

:: Handle Single or Multiple ZIPs
set ZIP_COUNT=0
for %%f in (%ZIP_FILES%) do set /a ZIP_COUNT+=1
if %ZIP_COUNT% equ 1 (
    for %%f in (%ZIP_FILES%) do set LATEST_ZIP=%%~nxf
    echo 🛠️ Found a single ZIP file: !LATEST_ZIP!
) else (
    echo Multiple ZIP files detected:
    set /a INDEX=1
    for %%f in (%ZIP_FILES%) do (
        echo [!INDEX!] %%~nxf
        set ZIP_!INDEX!=%%~nxf
        set /a INDEX+=1
    )
    set /p ZIP_CHOICE="Enter the number of the ZIP to use (default: 1): "
    if not defined ZIP_CHOICE set ZIP_CHOICE=1
    for /f "tokens=%ZIP_CHOICE%" %%f in ("%ZIP_FILES%") do set LATEST_ZIP=%%f
)

:: Apply Selected ZIP
echo 🛠️ Applying ZIP: "%LATEST_ZIP%"...
powershell -Command "Expand-Archive -Force '%REPO_DIR%\%LATEST_ZIP%' -DestinationPath .\temp_unzip"
xcopy /s /y "temp_unzip\*" "%REPO_DIR%" >nul
rmdir /s /q temp_unzip

:: Update VERSION File
if not exist "VERSION" echo 0 > VERSION
for /f "tokens=1-3" %%v in ('type VERSION') do set CURRENT_VERSION=%%v
set /a NEXT_VERSION=%CURRENT_VERSION%+1
echo %NEXT_VERSION% %LATEST_ZIP% >> VERSION

:: Commit and Push Changes
set BRANCH_NAME=contrib_%DATE:~10,4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%
git checkout -b %BRANCH_NAME%
git add .
set COMMIT_MSG="Applied updates from %LATEST_ZIP% | Version %NEXT_VERSION%"
git commit -m "%COMMIT_MSG%" || echo ⚠️ Git commit failed!
git push origin %BRANCH_NAME% || echo ⚠️ Git push failed!

:: Open Pull Request
start "" "https://github.com/salavey13/tupabase13/pulls"
echo 🎉 Changes pushed. Go create a Pull Request now!
pause
