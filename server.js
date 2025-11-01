const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database/db');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Simple session storage (in production, use proper sessions)
const sessions = {};

// Middleware for authentication
function authenticate(req, res, next) {
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;
    const session = sessions[sessionId];
    
    if (session && session.user) {
        req.user = session.user;
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// ============= AUTHENTICATION ROUTES =============

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    // Validate college email
    if (!email.endsWith('@college.edu')) {
        return res.status(400).json({ error: 'Please use your college email' });
    }
    
    // Simple authentication (in production, use hashed passwords)
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
        // Auto-register new users
        const insertUser = db.prepare('INSERT INTO users (email, name, role) VALUES (?, ?, ?)');
        const result = insertUser.run(email, email.split('@')[0], 'student');
        const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        
        const sessionId = uuidv4();
        sessions[sessionId] = { user: newUser };
        return res.json({ sessionId, user: newUser });
    }
    
    const sessionId = uuidv4();
    sessions[sessionId] = { user };
    res.json({ sessionId, user });
});

// Get current user
app.get('/api/auth/user', authenticate, (req, res) => {
    res.json({ user: req.user });
});

// ============= MENU ROUTES =============

// Get menu items
app.get('/api/menu', (req, res) => {
    const { category } = req.query;
    
    let query = 'SELECT * FROM menu_items WHERE is_available = 1';
    let params = [];
    
    if (category && category !== 'all') {
        query += ' AND category = ?';
        params.push(category);
    }
    
    query += ' ORDER BY category, name';
    
    const items = db.prepare(query).all(...params);
    res.json(items);
});

// ============= ORDER ROUTES =============

// Create order
app.post('/api/orders', authenticate, (req, res) => {
    const { items, pickup_time, special_instructions, payment_method } = req.body;
    
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Calculate total
    let total = 0;
    const menuItems = {};
    
    const stmt = db.prepare('SELECT * FROM menu_items WHERE id = ?');
    items.forEach(item => {
        const menuItem = stmt.get(item.menuItemId);
        if (menuItem) {
            total += menuItem.price * item.quantity;
            menuItems[item.menuItemId] = menuItem;
        }
    });
    
    // Generate order number
    const orderNumber = 'QB-' + Date.now().toString().slice(-6);
    
    // Create order
    const insertOrder = db.prepare(`
        INSERT INTO orders (user_id, status, total_amount, pickup_time, special_instructions, payment_method, order_number)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertOrder.run(
        req.user.id,
        'ordered',
        total,
        pickup_time,
        special_instructions || '',
        payment_method || 'college_card',
        orderNumber
    );
    
    const orderId = result.lastInsertRowid;
    
    // Create QR code
    QRCode.toDataURL(orderNumber, (err, qrCodeData) => {
        if (err) {
            console.error('QR Code generation error:', err);
        }
        
        // Update order with QR code
        db.prepare('UPDATE orders SET qr_code = ? WHERE id = ?').run(qrCodeData, orderId);
        
        // Insert order items
        const insertOrderItem = db.prepare(`
            INSERT INTO order_items (order_id, menu_item_id, quantity, customizations)
            VALUES (?, ?, ?, ?)
        `);
        
        items.forEach(item => {
            insertOrderItem.run(orderId, item.menuItemId, item.quantity, JSON.stringify(item.customizations || {}));
        });
        
        // Get complete order
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
        res.json({ order, qrCode: qrCodeData });
    });
});

// Get user orders
app.get('/api/orders', authenticate, (req, res) => {
    const query = `
        SELECT o.*, 
               GROUP_CONCAT(oi.menu_item_id || ':' || oi.quantity) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `;
    
    const orders = db.prepare(query).all(req.user.id);
    res.json(orders);
});

// Get single order
app.get('/api/orders/:id', authenticate, (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    const items = db.prepare(`
        SELECT oi.*, mi.name, mi.price, mi.image_url
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = ?
    `).all(req.params.id);
    
    res.json({ order, items });
});

// Cancel order
app.post('/api/orders/:id/cancel', authenticate, (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.status === 'ready' || order.status === 'collected') {
        return res.status(400).json({ error: 'Cannot cancel order at this stage' });
    }
    
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('cancelled', req.params.id);
    res.json({ success: true });
});

// ============= STAFF ROUTES =============

// Get all orders for staff
app.get('/api/staff/orders', authenticate, (req, res) => {
    if (req.user.role !== 'staff') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    
    const query = `
        SELECT o.*, u.name as user_name
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.status != 'collected'
        ORDER BY o.created_at DESC
    `;
    
    const orders = db.prepare(query).all();
    
    // Get items for each order
    const result = orders.map(order => {
        const items = db.prepare(`
            SELECT oi.*, mi.name, mi.price
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE oi.order_id = ?
        `).all(order.id);
        
        return { ...order, items };
    });
    
    res.json(result);
});

// Update order status
app.patch('/api/staff/orders/:id/status', authenticate, (req, res) => {
    if (req.user.role !== 'staff') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { status } = req.body;
    
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
});

// Update menu item availability
app.patch('/api/staff/menu/:id/availability', authenticate, (req, res) => {
    if (req.user.role !== 'staff') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { is_available } = req.body;
    
    db.prepare('UPDATE menu_items SET is_available = ? WHERE id = ?').run(is_available ? 1 : 0, req.params.id);
    res.json({ success: true });
});

// Get today's analytics
app.get('/api/staff/analytics/today', authenticate, (req, res) => {
    if (req.user.role !== 'staff') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const stats = db.prepare(`
        SELECT 
            COUNT(*) as total_orders,
            SUM(total_amount) as total_revenue,
            AVG(total_amount) as avg_order_value,
            COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_count,
            COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_count
        FROM orders
        WHERE DATE(created_at) = ?
    `).get(today);
    
    res.json(stats);
});

// Serve frontend routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student', 'dashboard.html'));
});

app.get('/staff', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'staff', 'dashboard.html'));
});

app.listen(PORT, () => {
    console.log(`QuickBite Campus server running on http://localhost:${PORT}`);
});

