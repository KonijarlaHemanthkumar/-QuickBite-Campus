# 🍔 QuickBite Campus

A lightning-fast campus food ordering system that eliminates queues and simplifies ordering for students and staff.

## 🚀 Features

### For Students
- **Quick Ordering**: Browse menu and add items to cart instantly
- **Real-time Tracking**: Track your order status in real-time
- **QR Code System**: Generate QR codes for easy order collection
- **Mobile-First Design**: Beautiful UI optimized for mobile devices
- **Category Filtering**: Easily filter by Breakfast, Lunch, Snacks, Drinks

### For Staff
- **Order Management**: View and update order statuses
- **Menu Control**: Toggle item availability in real-time
- **Analytics Dashboard**: Track daily orders and revenue
- **Kanban Board**: Visual order queue with drag-and-drop status updates

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js with Express
- **Database**: SQLite
- **Real-time**: Simple polling (auto-refresh every 5 seconds)
- **QR Codes**: qrcode library

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher) - Download from [nodejs.org](https://nodejs.org/)
- npm (comes with Node.js)

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   ```bash
   node database/init.js
   ```
   This creates the database with sample menu items and test users.

3. **Start Server**
   ```bash
   npm start
   ```

4. **Access the Application**
   - Open your browser to `http://localhost:3000`
   - Login with any of these accounts (no password required for demo):
     - `student1@college.edu`
     - `student2@college.edu`
     - `staff@college.edu`

## 🎯 Usage

### Student Workflow
1. Login with college email
2. Browse menu and add items to cart
3. Select pickup time (15/30/45 minutes)
4. Place order and receive QR code
5. Show QR code at pickup counter

### Staff Workflow
1. Login as staff member
2. View active orders queue
3. Update order statuses
4. Manage menu availability
5. Monitor daily analytics

## 📁 Project Structure

```
quickbite-campus/
├── database/
│   ├── schema.sql          # Database schema
│   ├── init.js             # Database initialization
│   ├── db.js               # Database connection
│   └── quickbite.db        # SQLite database file
├── public/
│   ├── style.css           # Global styles
│   ├── index.html          # Login page
│   ├── student/
│   │   ├── dashboard.html  # Student dashboard
│   │   └── order.html      # Order tracking
│   └── staff/
│       └── dashboard.html  # Staff dashboard
├── server.js               # Express server & API routes
└── package.json            # Dependencies
```

## 🔑 Default Credentials

- **Student**: `student1@college.edu` / any password
- **Student 2**: `student2@college.edu` / any password
- **Staff**: `staff@college.edu` / any password

## 🎨 Design Features

- **Modern UI**: Clean, glassmorphism-inspired cards
- **Smooth Animations**: Hover effects and transitions
- **Color Coded Status**: Visual order status indicators
- **Responsive Design**: Works on all device sizes

## 🚦 API Endpoints

### Student Routes
- `POST /api/login` - User authentication
- `GET /api/menu` - Get menu items
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/cancel` - Cancel order

### Staff Routes
- `GET /api/staff/orders` - Get all orders
- `PATCH /api/staff/orders/:id/status` - Update order status
- `GET /api/staff/analytics/today` - Get today's analytics
- `PATCH /api/staff/menu/:id/availability` - Toggle menu item

## 📊 Database Schema

- **users**: Student and staff accounts
- **menu_items**: Food menu items
- **orders**: Customer orders
- **order_items**: Individual items in each order

## 🔄 Real-time Updates

The system uses automatic polling to update:
- Order status (every 5 seconds)
- Menu availability (staff dashboard)
- Analytics data

## 🎯 Future Enhancements

- [ ] Email notifications
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Payment integration
- [ ] Order history
- [ ] Favorite items
- [ ] Rush hour predictions

## 📝 License

ISC

## 👥 Contributors

Built with ❤️ for modern campus dining experience

