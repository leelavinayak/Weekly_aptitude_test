require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const supabase = require('./config/supabase');

if (!process.env.SUPABASE_URL) {
    console.error('CRITICAL: SUPABASE_URL is not defined in ../.env');
}

const app = express();

// Database Connection check
if (supabase) {
    console.log('Supabase client initialized');
}


// Production Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('combined')); // Production logging

// Rate Limiting (Generous for development)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requests per 15 min in dev
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// CORS Configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' })); // Increased limit for profile pics/assets

// Request logging (Simple for dev, morgan handles production)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Static files and SPA routing
if (process.env.NODE_ENV === 'production') {
    const clientPath = path.join(__dirname, '../client/dist');
    app.use(express.static(clientPath));
    
    // Serve index.html for any non-API routes (SPA fallback)
    // We only serve index.html for routes that don't look like files (no dot in path)
    app.get('/:path*', (req, res, next) => {
        if (!req.path.startsWith('/api') && !req.path.includes('.')) {
            res.sendFile(path.join(clientPath, 'index.html'));
        } else {
            next();
        }
    });
} else {
    app.get('/', (req, res) => {
        res.send('Quiz app API is running...');
    });
}

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

