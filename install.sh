#!/bin/bash

# Print colorful status messages
print_status() {
    echo -e "\033[1;34m==>\033[0m \033[1m$1\033[0m"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION=14

if (( $(echo "$NODE_VERSION < $REQUIRED_VERSION" | bc -l) )); then
    echo "Error: Node.js version $NODE_VERSION is not supported. Please install Node.js v14 or higher."
    exit 1
fi

print_status "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully!"
    print_status "You can now start the development server with: npm start"
else
    echo "Error: Failed to install dependencies."
    exit 1
fi 