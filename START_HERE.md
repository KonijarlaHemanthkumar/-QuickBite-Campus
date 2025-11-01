# 🚀 How to Run QuickBite Campus

## Step 1: Verify Node.js Installation

After installing Node.js, you need to **restart your terminal/IDE** so it can find the `npm` command.

### In Cursor/VS Code:
1. Close the integrated terminal
2. Open a new terminal (Ctrl + `)
3. Type: `node --version`
4. You should see something like: `v18.x.x` or `v20.x.x`

If you see "command not found", you need to:
- Completely close and reopen Cursor
- Or restart your computer

## Step 2: Run These Commands in Order

Open your terminal in this folder: `c:\Users\Admin\OneDrive\Desktop\sowdhi`

### 1. Install Dependencies
```bash
npm install
```
This will install all required packages (express, better-sqlite3, qrcode, etc.)

### 2. Initialize Database
```bash
node database/init.js
```
This creates the database and adds sample menu items.

### 3. Start the Server
```bash
npm start
```
You should see: "QuickBite Campus server running on http://localhost:3000"

## Step 3: Open in Browser

Open your browser and go to: **http://localhost:3000**

## Step 4: Test the Application

Click "Student" or "Staff" button on the login page to test the app!

## Troubleshooting

### "npm is not recognized"
**Solution**: Close and reopen Cursor completely. Node.js was just installed and needs a fresh terminal.

### "Port 3000 already in use"
**Solution**: Find the file `server.js` and change the port from `3000` to `3001` (or any other number)

### "Cannot find module"
**Solution**: Make sure you ran `npm install` first

## Need Help?

Check these files:
- `README.md` - Full documentation
- `QUICKSTART.md` - Quick start guide
- `PROJECT_SUMMARY.md` - Project overview





