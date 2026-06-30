#!/bin/bash
# Clear iOS Simulator data for Arcade Academy

echo "🧹 Clearing Arcade Academy app data..."

# Find the app's container
APP_ID="host.exp.Exponent"

# Kill simulator
xcrun simctl shutdown all 2>/dev/null

# Erase specific app data (requires simulator to be running)
echo "📱 Please do the following manually:"
echo "1. Open iOS Simulator"
echo "2. Device > Erase All Content and Settings..."
echo "3. Press Enter when done"
read -p "Press Enter to continue..."

echo "✅ Ready to restart!"







