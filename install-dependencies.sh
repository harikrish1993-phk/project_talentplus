#!/bin/bash

# ============================================================================
# TalentPulse AI - Dependency Installation Script
# ============================================================================
# This script installs all required dependencies for the TalentPulse AI project
# Usage: ./install-dependencies.sh
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Print banner
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         TalentPulse AI - Installation Script              ║"
echo "║                                                            ║"
echo "║  This script will install all project dependencies        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
print_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    print_info "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION is installed"

# Check Node.js version
NODE_MAJOR_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher (current: $NODE_VERSION)"
    print_info "Please upgrade Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
print_info "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm $NPM_VERSION is installed"

# Navigate to project directory
print_info "Navigating to project directory..."
cd "$(dirname "$0")/.." || exit 1
PROJECT_DIR=$(pwd)
print_success "Project directory: $PROJECT_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found in $PROJECT_DIR"
    print_info "Make sure you're running this script from the project root"
    exit 1
fi

# Clean existing node_modules and lock files
print_info "Cleaning existing installations..."
if [ -d "node_modules" ]; then
    print_warning "Removing existing node_modules directory..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    print_warning "Removing existing package-lock.json..."
    rm -f package-lock.json
fi

if [ -f "pnpm-lock.yaml" ]; then
    print_warning "Removing existing pnpm-lock.yaml..."
    rm -f pnpm-lock.yaml
fi

if [ -f "yarn.lock" ]; then
    print_warning "Removing existing yarn.lock..."
    rm -f yarn.lock
fi

# Install dependencies
print_info "Installing dependencies (this may take a few minutes)..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully!"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Check if .env.local exists
print_info "Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found"
    if [ -f "env.example" ]; then
        print_info "Creating .env.local from env.example..."
        cp env.example .env.local
        print_success ".env.local created"
        print_warning "⚠️  IMPORTANT: Edit .env.local and add your actual API keys and configuration"
    else
        print_error "env.example not found. Cannot create .env.local"
    fi
else
    print_success ".env.local already exists"
fi

# Run type check
print_info "Running TypeScript type check..."
npm run type-check

if [ $? -eq 0 ]; then
    print_success "Type check passed!"
else
    print_warning "Type check failed. There may be TypeScript errors in the code."
    print_info "You can continue, but fix these errors before production deployment."
fi

# Run linting
print_info "Running ESLint..."
npm run lint

if [ $? -eq 0 ]; then
    print_success "Linting passed!"
else
    print_warning "Linting found issues. Run 'npm run lint:fix' to auto-fix."
fi

# Print next steps
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  Installation Complete!                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
print_success "All dependencies have been installed successfully!"
echo ""
print_info "Next steps:"
echo ""
echo "  1. Configure your environment variables:"
echo "     ${YELLOW}nano .env.local${NC}"
echo ""
echo "  2. Set up your Supabase project:"
echo "     - Create a project at https://supabase.com"
echo "     - Copy your project URL and API keys to .env.local"
echo "     - Run the database schema: database/schema.sql"
echo "     - Run the RLS policies: database/002_rls_policies.sql"
echo ""
echo "  3. Set up AI providers:"
echo "     - Get OpenAI API key from https://platform.openai.com"
echo "     - Or get Anthropic API key from https://console.anthropic.com"
echo "     - Add the keys to .env.local"
echo ""
echo "  4. Start the development server:"
echo "     ${GREEN}npm run dev${NC}"
echo ""
echo "  5. Open your browser:"
echo "     ${BLUE}http://localhost:3000${NC}"
echo ""
print_info "For detailed setup instructions, see INSTALLATION.md"
echo ""
