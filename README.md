# Intuition Raycast Extension

Search the Intuition knowledge graph directly from your macOS menu bar using Raycast.

## What is this?

This extension lets you quickly search and access information from the Intuition knowledge graph without leaving your menu bar. It's perfect for quick lookups and staying productive.

## Prerequisites

Before installing this extension, you'll need to set up a few things on your Mac:

### 1. Install Raycast

1. Visit [raycast.com](https://raycast.com)
2. Click "Download for Mac"
3. Open the downloaded file
4. Drag Raycast to your Applications folder
5. Open Raycast from your Applications folder
6. Follow the setup wizard to complete installation

### 2. Install Node.js

1. First, install Homebrew (if you don't have it):

   - Open Terminal (you can find it by pressing Cmd + Space and typing "Terminal")
   - Copy and paste this command:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

   - Follow the prompts to complete installation

2. Install Node.js using Homebrew:

   - In Terminal, run:

   ```bash
   brew install node
   ```

   - Wait for the installation to complete

3. Verify the installation:
   - In Terminal, run:
   ```bash
   node --version
   ```
   - You should see a version number (16.10 or higher)

### 3. Install pnpm

1. In Terminal, run:
   ```bash
   npm install -g pnpm
   ```
2. Verify the installation:
   ```bash
   pnpm --version
   ```
   - You should see a version number

## Installation

1. Download this extension:

   - Click the green "Code" button above
   - Click "Download ZIP"
   - Extract the ZIP file to a location you can find easily

2. Open Terminal and navigate to the extension folder:

   ```bash
   cd ~/Downloads/intuition-raycast  # or wherever you extracted the ZIP
   ```

3. Install the dependencies:

   ```bash
   pnpm i
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

## Adding to Menu Bar

1. Open Raycast (you can use Cmd + Space and type "Raycast")
2. Type "Intuition Menu" in the search bar
3. Click on the "Intuition Menu" command
4. The extension will now be available in your menu bar

## Troubleshooting

If you run into any issues:

1. Make sure Raycast is running (look for the Raycast icon in your menu bar)
2. Try restarting Raycast
3. Check that all prerequisites are installed correctly by running these commands in Terminal:
   ```bash
   node --version
   pnpm --version
   ```
4. If you see any error messages, please share them in the issues section

## Need Help?

- Check out [Raycast's documentation](https://developers.raycast.com/api-reference/menu-bar-commands) for more details about menu bar commands
- If you're having trouble, feel free to open an issue in this repository
