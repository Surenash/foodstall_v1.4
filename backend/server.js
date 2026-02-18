const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { pool } = require('./config/database');
const stallsRouter = require('./routes/stalls');
const ownerRouter = require('./routes/owner');
const usersRouter = require('./routes/users');
const { sendOTP, verifyOTP, generateToken } = require('./middleware/auth');
const { query } = require('./config/database');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io for real-time updates
const io = socketIo(server, {
    cors: {
        origin: "*", // Configure properly in production
        methods: ["GET", "POST"]
    }
});

// Make io available to routes
app.set('io', io);

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Request logging

// Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Create uploads directory
const fs = require('fs');
const uploadsDir = './uploads/hygiene-photos';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create profile photos directory
const profilePhotosDir = './uploads/profile-photos';
if (!fs.existsSync(profilePhotosDir)) {
    fs.mkdirSync(profilePhotosDir, { recursive: true });
}

// =====================================================
// ROUTES
// =====================================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: pool.totalCount > 0 ? 'Connected' : 'Disconnected'
    });
});

// Authentication routes
app.post('/api/v1/auth/request-otp', async (req, res) => {
    try {
        const { phone_number } = req.body;

        if (!phone_number) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        const result = await sendOTP(phone_number);
        res.json(result);
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

app.post('/api/v1/auth/verify-otp', async (req, res) => {
    try {
        const { phone_number, otp, name } = req.body;

        if (!phone_number || !otp) {
            return res.status(400).json({ error: 'Phone number and OTP are required' });
        }

        const verification = verifyOTP(phone_number, otp);

        if (!verification.success) {
            return res.status(400).json({ error: verification.message });
        }

        // Find or create user
        let userResult = await query(
            'SELECT * FROM users WHERE phone_number = $1',
            [phone_number]
        );

        let user;
        if (userResult.rows.length === 0) {
            // Create new user
            const newUserResult = await query(
                'INSERT INTO users (phone_number, name) VALUES ($1, $2) RETURNING *',
                [phone_number, name || null]
            );
            user = newUserResult.rows[0];
        } else {
            user = userResult.rows[0];
        }

        // Generate JWT token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            user,
            token,
        });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

// Stall routes (user-facing)
app.use('/api/v1/stalls', stallsRouter);

// Owner routes
app.use('/api/v1/owner', ownerRouter);

// User routes (profile, favorites, reviews, notifications)
app.use('/api/v1/users', usersRouter);

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// =====================================================
// SOCKET.IO - Real-time Updates
// =====================================================

io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Owner goes online/offline
    socket.on('owner_status_change', (data) => {
        console.log('Status change:', data);
        // Broadcast to all clients
        io.emit('stall_status_update', data);
    });

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log('╔════════════════════════════════════════════╗');
    console.log(`║  🍲 Food Stall API Server Running          ║`);
    console.log(`║  📍 Port: ${PORT}                             ║`);
    console.log(`║  🌐 Environment: ${process.env.NODE_ENV || 'development'}           ║`);
    console.log(`║  📱 Network: http://192.168.0.115:${PORT}     ║`);
    console.log('╚════════════════════════════════════════════╝');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        pool.end(() => {
            console.log('Database pool closed');
            process.exit(0);
        });
    });
});
