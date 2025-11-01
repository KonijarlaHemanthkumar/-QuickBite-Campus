# 🚀 Quick Start Guide

## Prerequisites
Make sure you have Node.js installed. If not, download it from [nodejs.org](https://nodejs.org/)

## Setup in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
node database/init.js
```

You should see: "Database initialized and seeded successfully!"

### 3. Start the Server
```bash
npm start
```

You should see: "QuickBite Campus server running on http://localhost:3000"

## Access the Application

1. Open your browser to `http://localhost:3000`

2. Try logging in with these accounts:
   - **Student**: Click "Student" button on login page, or use email `student1@college.edu`
   - **Staff**: Click "Staff" button on login page, or use email `staff@college.edu`

## Test the Application

### As a Student:
1. Browse the menu
2. Add items to your cart
3. Select pickup time (15/30/45 minutes)
4. Place an order
5. View your order status and QR code

### As Staff:
1. View all active orders
2. Update order statuses (ordered → preparing → ready → collected)
3. Toggle menu item availability
4. Check today's analytics

## Troubleshooting

**Port already in use?**
- Change the port in `server.js` from 3000 to another number (e.g., 3001)
- Update the URL in your browser accordingly

**Database errors?**
- Delete `database/quickbite.db`
- Run `node database/init.js` again

**Module not found errors?**
- Make sure you ran `npm install` first
- Check that `node_modules` folder exists

## Stopping the Server
Press `Ctrl + C` in the terminal

## Restarting
```bash
npm start
```

Enjoy QuickBite Campus! 🍔

