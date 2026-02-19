#!/bin/bash
# Navigate to the mobile-expo directory just in case
cd "$(dirname "$0")"

# Create a clean temporary directory
rm -rf /tmp/mobile_expo_final
mkdir -p /tmp/mobile_expo_final

# Sync the code to the temporary directory
rsync -av --exclude 'node_modules' --exclude '.git' --exclude '.expo' ./ /tmp/mobile_expo_final/

# Navigate to the temporary directory
cd /tmp/mobile_expo_final

# Install dependencies to ensure plugins and config can be resolved
npm install


# Run the build
export EAS_NO_VCS=1
npx eas-cli build -p android --profile preview --non-interactive
