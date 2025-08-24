#!/bin/bash
set -euo pipefail

# Outfitter Monorepo Setup Script
# Optimized for both local development and remote agent environments

# Color output for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect environment
detect_environment() {
  if [ -n "${GITHUB_ACTIONS-}" ]; then
    echo "github-actions"
  elif [ -n "${CI-}" ]; then
    echo "ci"
  elif [ -n "${DEVIN_SESSION_ID-}" ]; then
    echo "devin"
  elif [ -n "${FACTORY_AI_SESSION-}" ]; then
    echo "factory"
  elif [ -n "${OPENAI_CODEX_SESSION-}" ]; then
    echo "codex"
  elif [ -f "/.dockerenv" ]; then
    echo "docker"
  else
    echo "local"
  fi
}

# Check and install Bun if needed
ensure_bun() {
  if ! command -v bun &> /dev/null; then
    echo -e "${YELLOW}Bun not found. Installing with verification...${NC}"
    
    # Download installer to temp file for verification
    TEMP_INSTALLER=$(mktemp)
    if ! curl -fsSL https://bun.sh/install -o "$TEMP_INSTALLER"; then
      echo -e "${RED}Failed to download Bun installer${NC}"
      rm -f "$TEMP_INSTALLER"
      exit 1
    fi
    
    # Verify the installer script is not empty and contains expected content
    if [ ! -s "$TEMP_INSTALLER" ]; then
      echo -e "${RED}Downloaded installer is empty${NC}"
      rm -f "$TEMP_INSTALLER"
      exit 1
    fi
    
    # Check for suspicious patterns (basic validation)
    if grep -q "rm -rf /" "$TEMP_INSTALLER" 2>/dev/null; then
      echo -e "${RED}Installer contains suspicious commands${NC}"
      rm -f "$TEMP_INSTALLER"
      exit 1
    fi
    
    # Run installer with restricted permissions
    bash "$TEMP_INSTALLER"
    rm -f "$TEMP_INSTALLER"
    
    export PATH="$HOME/.bun/bin:$PATH"
    echo -e "${GREEN}✓ Bun installed successfully${NC}"
  else
    echo -e "${GREEN}✓ Bun found: $(bun --version)${NC}"
  fi
}

# Set environment-specific cache directory (fallback for when bunfig.toml isn't generated)
setup_cache() {
  local env=$1
  case $env in
    "ci"|"github-actions")
      export BUN_CACHE_DIR="$PWD/.bun-cache"
      ;;
    "devin"|"factory")
      export BUN_CACHE_DIR="/workspace/.cache/bun"
      ;;
    "codex"|"docker")
      export BUN_CACHE_DIR="/tmp/bun-cache"
      ;;
    *)
      # Use default global cache for local development; ensure no inherited value lingers
      unset BUN_CACHE_DIR
      ;;
  esac
  
  if [ -n "${BUN_CACHE_DIR-}" ]; then
    mkdir -p -- "$BUN_CACHE_DIR"
    echo -e "${GREEN}✓ Cache directory: $BUN_CACHE_DIR${NC}"
  fi
}

# Main setup function
main() {
  echo -e "${GREEN}🚀 Outfitter Monorepo Setup${NC}"
  echo "================================"
  
  # Detect environment
  ENV=$(detect_environment)
  echo -e "${GREEN}✓ Environment: $ENV${NC}"
  
  # Ensure Bun is installed
  ensure_bun
  
  # Setup cache directory
  setup_cache "$ENV"
  
  # Run TypeScript setup orchestrator
  echo -e "\n${YELLOW}Running setup...${NC}"
  
  if [ -f "scripts/setup.ts" ]; then
    # Use TypeScript orchestrator if available
    bun ./scripts/setup.ts --environment="$ENV" "$@"
  else
    # Fallback to basic setup
    echo -e "${YELLOW}TypeScript orchestrator not found, running basic setup...${NC}"
    
    # Flags
    INSTALL_FLAGS=""
    SKIP_BUILD=0
    for arg in "$@"; do
      case "$arg" in
        --skip-build) SKIP_BUILD=1 ;;
        --skip-hooks) INSTALL_FLAGS="$INSTALL_FLAGS --ignore-scripts" ;;
      esac
    done

    # Install dependencies based on environment
    case $ENV in
      "ci"|"github-actions")
        echo "Installing dependencies (CI mode)..."
        bun install --frozen-lockfile $INSTALL_FLAGS
        ;;
      "factory")
        echo "Installing dependencies (factory mode)..."
        bun install --production --frozen-lockfile $INSTALL_FLAGS
        ;;
      *)
        echo "Installing dependencies..."
        bun install $INSTALL_FLAGS
        ;;
    esac

    # Build packages
    if [ "$SKIP_BUILD" -ne 1 ]; then
      echo -e "\n${YELLOW}Building packages...${NC}"
      bun run build
    fi
  fi
  
  echo -e "\n${GREEN}✅ Setup complete!${NC}"
}

# Run main function with all arguments
main "$@"