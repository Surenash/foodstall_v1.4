const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Verifies JWT token from request headers
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                error: 'Invalid or expired token'
            });
        }

        req.user = user;
        next();
    });
}

/**
 * Generate JWT token for user
 */
function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            phone_number: user.phone_number
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

/**
 * OTP Authentication (Placeholder)
 * In production, integrate with SMS service (Twilio, AWS SNS, etc.)
 */
async function sendOTP(phoneNumber) {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // TODO: Send OTP via SMS service
    console.log(`📱 OTP for ${phoneNumber}: ${otp}`);

    // In development, store in memory (use Redis in production)
    if (!global.otpStore) {
        global.otpStore = {};
    }

    global.otpStore[phoneNumber] = {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    return { success: true, message: 'OTP sent successfully' };
}

/**
 * Verify OTP
 */
function verifyOTP(phoneNumber, otp) {
    if (!global.otpStore || !global.otpStore[phoneNumber]) {
        return { success: false, message: 'OTP not found or expired' };
    }

    const storedData = global.otpStore[phoneNumber];

    if (Date.now() > storedData.expiresAt) {
        delete global.otpStore[phoneNumber];
        return { success: false, message: 'OTP expired' };
    }

    if (storedData.otp !== otp) {
        return { success: false, message: 'Invalid OTP' };
    }

    // Clear OTP after successful verification
    delete global.otpStore[phoneNumber];

    return { success: true, message: 'OTP verified successfully' };
}

module.exports = {
    authenticateToken,
    generateToken,
    sendOTP,
    verifyOTP,
};
