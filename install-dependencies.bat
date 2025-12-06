@echo off
REM ============================================================================
REM TalentPulse AI - Dependency Installation Script (Windows)
REM ============================================================================
REM This script installs all required dependencies for the TalentPulse AI project
REM Usage: install-dependencies.bat
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ================================================================
echo          TalentPulse AI - Installation Script (Windows)
echo.
echo   This script will install all project dependencies
echo ================================================================
echo.

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo [INFO] Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js %NODE_VERSION% is installed

REM Check if npm is installed
echo [INFO] Checking npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [SUCCESS] npm %NPM_VERSION% is installed

REM Navigate to project directory
echo [INFO] Navigating to project directory...
cd /d "%~dp0\.."
set PROJECT_DIR=%CD%
echo [SUCCESS] Project directory: %PROJECT_DIR%

REM Check if package.json exists
if not exist "package.json" (
    echo [ERROR] package.json not found in %PROJECT_DIR%
    echo [INFO] Make sure you're running this script from the project root
    pause
    exit /b 1
)

REM Clean existing node_modules and lock files
echo [INFO] Cleaning existing installations...
if exist "node_modules" (
    echo [WARNING] Removing existing node_modules directory...
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    echo [WARNING] Removing existing package-lock.json...
    del /f /q package-lock.json
)

if exist "pnpm-lock.yaml" (
    echo [WARNING] Removing existing pnpm-lock.yaml...
    del /f /q pnpm-lock.yaml
)

if exist "yarn.lock" (
    echo [WARNING] Removing existing yarn.lock...
    del /f /q yarn.lock
)

REM Install dependencies
echo [INFO] Installing dependencies (this may take a few minutes)...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [SUCCESS] Dependencies installed successfully!

REM Check if .env.local exists
echo [INFO] Checking environment configuration...
if not exist ".env.local" (
    echo [WARNING] .env.local not found
    if exist "env.example" (
        echo [INFO] Creating .env.local from env.example...
        copy env.example .env.local >nul
        echo [SUCCESS] .env.local created
        echo [WARNING] IMPORTANT: Edit .env.local and add your actual API keys and configuration
    ) else (
        echo [ERROR] env.example not found. Cannot create .env.local
    )
) else (
    echo [SUCCESS] .env.local already exists
)

REM Run type check
echo [INFO] Running TypeScript type check...
call npm run type-check

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Type check passed!
) else (
    echo [WARNING] Type check failed. There may be TypeScript errors in the code.
    echo [INFO] You can continue, but fix these errors before production deployment.
)

REM Run linting
echo [INFO] Running ESLint...
call npm run lint

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Linting passed!
) else (
    echo [WARNING] Linting found issues. Run 'npm run lint:fix' to auto-fix.
)

REM Print next steps
echo.
echo ================================================================
echo                  Installation Complete!
echo ================================================================
echo.
echo [SUCCESS] All dependencies have been installed successfully!
echo.
echo [INFO] Next steps:
echo.
echo   1. Configure your environment variables:
echo      notepad .env.local
echo.
echo   2. Set up your Supabase project:
echo      - Create a project at https://supabase.com
echo      - Copy your project URL and API keys to .env.local
echo      - Run the database schema: database/schema.sql
echo      - Run the RLS policies: database/002_rls_policies.sql
echo.
echo   3. Set up AI providers:
echo      - Get OpenAI API key from https://platform.openai.com
echo      - Or get Anthropic API key from https://console.anthropic.com
echo      - Add the keys to .env.local
echo.
echo   4. Start the development server:
echo      npm run dev
echo.
echo   5. Open your browser:
echo      http://localhost:3000
echo.
echo [INFO] For detailed setup instructions, see INSTALLATION.md
echo.

pause
