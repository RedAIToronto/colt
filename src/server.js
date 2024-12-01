const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    pingTimeout: 60000,
    pingInterval: 25000
});
const path = require('path');

// Constants for rate limiting and configuration
const SCAN_INTERVAL = 30000;  // 30 seconds between scans
const REPLY_LIMIT = 3;        // Max 3 replies
const REPLY_WINDOW = 900000;  // In 15 minutes
const MAX_RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 5000;

// Initialize rate limiting state
let serverState = {
    replyCount: 0,
    lastReplyTime: Date.now(),
    activeConnections: 0,
    isScanning: false
};

// Middleware for basic security
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve static files with caching
app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: '1h',
    etag: true
}));

// Main page route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Enhanced health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        connections: serverState.activeConnections,
        scanning: serverState.isScanning
    });
});

// Rate limiting functions
function canReply() {
    const now = Date.now();
    if (now - serverState.lastReplyTime > REPLY_WINDOW) {
        serverState.replyCount = 0;
        serverState.lastReplyTime = now;
        return true;
    }
    return serverState.replyCount < REPLY_LIMIT;
}

function trackReply() {
    serverState.replyCount++;
    serverState.lastReplyTime = Date.now();
}

// Socket.IO connection handling
io.on('connection', async (socket) => {
    serverState.activeConnections++;
    console.log(`🔌 Client connected (Total: ${serverState.activeConnections})`);

    // Send initial state to client
    socket.emit('server_state', {
        replyCount: serverState.replyCount,
        scanning: serverState.isScanning,
        timestamp: new Date().toISOString()
    });

    // Handle scanner initialization
    if (!serverState.isScanning) {
        try {
            serverState.isScanning = true;
            const { searchXRPTweets } = require('./searchXRP');
            
            // Initialize scanner with proper error handling
            await searchXRPTweets(io).catch(error => {
                console.error('Scanner error:', error);
                serverState.isScanning = false;
                socket.emit('error', {
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            });
        } catch (error) {
            serverState.isScanning = false;
            console.error('Failed to initialize scanner:', error);
            socket.emit('error', {
                message: 'Scanner initialization failed',
                details: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Handle disconnection
    socket.on('disconnect', () => {
        serverState.activeConnections--;
        console.log(`🔌 Client disconnected (Remaining: ${serverState.activeConnections})`);
    });

    // Handle client errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Error handling for the server
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Attempt graceful shutdown
    shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown function
async function shutdown() {
    console.log('🔄 Initiating graceful shutdown...');
    
    // Notify all connected clients
    io.emit('server_shutdown', {
        message: 'Server is shutting down',
        timestamp: new Date().toISOString()
    });

    // Close all socket connections
    io.close(() => {
        console.log('✅ Socket.IO server closed');
    });

    // Close HTTP server
    http.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });

    // Force exit after timeout
    setTimeout(() => {
        console.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Export necessary functions and constants
module.exports = {
    io,
    canReply,
    trackReply,
    SCAN_INTERVAL,
    REPLY_LIMIT,
    REPLY_WINDOW,
    serverState
};

// Start the server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`
🌐 Server initialized:
   - Port: ${PORT}
   - Environment: ${process.env.NODE_ENV || 'development'}
   - Reply Limit: ${REPLY_LIMIT} per ${REPLY_WINDOW/1000}s
   - Scan Interval: ${SCAN_INTERVAL/1000}s
    `);
}); 