#!/bin/bash

# Color codes for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Make script exit if any command fails
set -e

# Print a colored header
print_header() {
    echo -e "\n${BLUE}======================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}======================================${NC}\n"
}

# Print a step
print_step() {
    echo -e "${GREEN}==>${NC} ${YELLOW}$1${NC}"
}

# Print an error
print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

# Check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if git is installed
    if ! command_exists git; then
        print_error "Git is not installed. Please install git first."
        exit 1
    else
        print_step "Git is installed ✓"
    fi
    
    # Check if Node.js is installed
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    else
        node_version=$(node -v)
        print_step "Node.js $node_version is installed ✓"
    fi
    
    # Check if npm is installed
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    else
        npm_version=$(npm -v)
        print_step "npm $npm_version is installed ✓"
    fi
    
    # Check if Vercel CLI is installed
    if command_exists vercel; then
        vercel_version=$(vercel --version)
        print_step "Vercel CLI $vercel_version is installed ✓"
        has_vercel=true
    else
        print_step "Vercel CLI is not installed. Deployment to Vercel will not be available."
        print_step "To install Vercel CLI, run: npm install -g vercel"
        has_vercel=false
    fi
}

# Setup git repository
setup_git() {
    print_header "Setting up Git Repository"
    
    # Check if the GitHub repo is already set up
    if git remote -v 2>/dev/null | grep -q "github.com/atharvaawatade/VS-CODE-CLONE.git"; then
        print_step "GitHub remote is already set up."
    else
        # Initialize git if needed
        if [ ! -d .git ]; then
            print_step "Initializing git repository..."
            git init
        fi

        # Add the GitHub remote
        print_step "Adding GitHub remote..."
        git remote add origin https://github.com/atharvaawatade/VS-CODE-CLONE.git
    fi
    
    # Create .gitignore if it doesn't exist
    if [ ! -f .gitignore ]; then
        print_step "Creating .gitignore file..."
        cat > .gitignore << EOL
# Dependencies
node_modules
.pnp
.pnp.js

# Build outputs
dist
dist-ssr
*.local
build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor and OS files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
EOL
    fi
}

# Setup environment variables
setup_env() {
    print_header "Setting up Environment Variables"
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            print_step "Creating .env file from example..."
            cp .env.example .env
            echo -e "${YELLOW}Please edit .env to add your Gemini API key before deploying.${NC}"
            echo "Get your API key from: https://aistudio.google.com/app/apikey"
        else
            print_step "Creating .env file..."
            cat > .env << EOL
# Google Gemini API Key for AI code assistance
# Get your API key from: https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key_here
EOL
            echo -e "${YELLOW}Please edit .env to add your Gemini API key before deploying.${NC}"
        fi
    else
        print_step ".env file already exists."
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    if [ ! -d "node_modules" ]; then
        print_step "Installing npm packages..."
        npm install
    else
        print_step "Dependencies already installed. Use --force to reinstall."
        echo "Run 'npm install' manually if you want to update dependencies."
    fi
}

# Commit and push changes
commit_and_push() {
    print_header "Committing and Pushing Changes"
    
    # Check if there are any changes to commit
    if ! git diff-index --quiet HEAD -- || git ls-files --others --exclude-standard | grep -q .; then
        print_step "Adding files to git..."
        git add .
        
        print_step "Committing changes..."
        git commit -m "Initial commit: VS Code Clone with AI assistance"
        
        print_step "Pushing to GitHub..."
        echo -e "${YELLOW}You may need to enter your GitHub credentials.${NC}"
        git push -u origin main
    else
        print_step "No changes to commit."
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    print_header "Deploying to Vercel"
    
    if [ "$has_vercel" = true ]; then
        print_step "Deploying to Vercel..."
        echo -e "${YELLOW}You may need to login to Vercel if not already logged in.${NC}"
        
        # Check if vercel.json exists
        if [ ! -f "vercel.json" ]; then
            print_step "Creating vercel.json configuration..."
            cat > vercel.json << EOL
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/[^.]+",
      "dest": "/",
      "status": 200
    }
  ],
  "github": {
    "silent": true
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
EOL
        fi
        
        # Deploy with Vercel CLI
        vercel --prod
        
        print_step "Remember to set the VITE_GEMINI_API_KEY in your Vercel project settings."
        echo "Go to Project Settings > Environment Variables to add them."
    else
        print_error "Vercel CLI is not installed. Cannot deploy automatically."
        print_step "To deploy manually:"
        echo "1. Install Vercel CLI: npm install -g vercel"
        echo "2. Run: vercel --prod"
        echo "3. Set the VITE_GEMINI_API_KEY in your Vercel project settings"
    fi
}

# Build the project
build_project() {
    print_header "Building the Project"
    
    print_step "Running build..."
    npm run build
    
    print_step "Build completed successfully ✓"
}

# Show help
show_help() {
    echo -e "${BLUE}VS Code Clone Setup Script${NC}"
    echo "Usage: ./setup.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help                Display this help message"
    echo "  --git-only            Only set up Git repository"
    echo "  --env-only            Only set up environment variables"
    echo "  --deploy-vercel       Deploy to Vercel after setup"
    echo "  --build-only          Only build the project"
    echo "  --force               Force reinstall dependencies"
    echo ""
    echo "Example:"
    echo "  ./setup.sh --deploy-vercel    # Setup everything and deploy to Vercel"
}

# Main script execution
main() {
    # Check for help flag
    if [[ "$1" == "--help" ]]; then
        show_help
        exit 0
    fi
    
    # Parse options
    git_only=false
    env_only=false
    deploy=false
    build_only=false
    force=false
    
    for arg in "$@"
    do
        case $arg in
            --git-only)
                git_only=true
                ;;
            --env-only)
                env_only=true
                ;;
            --deploy-vercel)
                deploy=true
                ;;
            --build-only)
                build_only=true
                ;;
            --force)
                force=true
                ;;
        esac
    done
    
    # Check prerequisites for all operations
    check_prerequisites
    
    # Run selected operations
    if [ "$git_only" = true ]; then
        setup_git
    elif [ "$env_only" = true ]; then
        setup_env
    elif [ "$build_only" = true ]; then
        build_project
    else
        # Run all setup steps
        setup_git
        setup_env
        install_dependencies
        
        # Commit and push if any required
        if [ "$git_only" = false ] && [ "$env_only" = false ] && [ "$build_only" = false ]; then
            commit_and_push
        fi
        
        # Deploy if requested
        if [ "$deploy" = true ]; then
            build_project
            deploy_to_vercel
        fi
    fi
    
    print_header "Setup Complete!"
    echo -e "${GREEN}Your VS Code Clone project is ready!${NC}"
    
    if [ "$deploy" = false ] && [ "$build_only" = false ]; then
        echo ""
        echo -e "${YELLOW}Next steps:${NC}"
        echo "1. Edit .env to add your Gemini API key"
        echo "2. Run 'npm run dev' to start development server"
        echo "3. Or run './setup.sh --deploy-vercel' to deploy to Vercel"
    fi
}

# Run the main function with all arguments
main "$@" 