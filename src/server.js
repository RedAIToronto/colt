const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    pingTimeout: 60000,
    pingInterval: 25000
});
const path = require('path');
const { searchXRPTweets } = require('./searchXRP');

// Constants
const SCAN_INTERVAL = 120000; // 2 minutes
const REPLY_LIMIT = 3;
const REPLY_WINDOW = 900000;

// Global state to maintain logs and stats
const globalState = {
    logs: [],
    buildLogs: [],
    stats: {
        tweets: 0,
        replies: 0,
        sentiment: [],
        messages: 0,
        startTime: new Date().toISOString()
    },
    maxLogs: 1000 // Maximum number of logs to keep
};

// Middleware for basic security
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        stats: globalState.stats
    });
});

// Function to add log and broadcast to all clients
function addLog(content, type = 'log', target = 'monitor') {
    const logEntry = {
        timestamp: new Date().toISOString(),
        content,
        type
    };

    if (target === 'monitor') {
        globalState.logs.push(logEntry);
        if (globalState.logs.length > globalState.maxLogs) {
            globalState.logs.shift(); // Remove oldest log
        }
    } else {
        globalState.buildLogs.push(logEntry);
        if (globalState.buildLogs.length > globalState.maxLogs) {
            globalState.buildLogs.shift();
        }
    }

    globalState.stats.messages++;
    io.emit('new_log', { logEntry, target });
    io.emit('stats_update', globalState.stats);
}

// Socket connection handling
io.on('connection', async (socket) => {
    console.log('🔌 Client connected');
    
    // Send initial state to new client
    socket.emit('init_state', {
        logs: globalState.logs,
        buildLogs: globalState.buildLogs,
        stats: globalState.stats
    });

    // Start scanner if not already running
    if (!globalState.isScanning) {
        try {
            globalState.isScanning = true;
            addLog('🚀 COLT AI System Initializing...', 'system', 'build');
            
            // Initialize scanner with proper error handling
            await searchXRPTweets(io, addLog).catch(error => {
                console.error('Scanner error:', error);
                globalState.isScanning = false;
                addLog(`❌ Error: ${error.message}`, 'error');
                addLog(`System Error: ${error.message}`, 'error', 'build');
            });
        } catch (error) {
            globalState.isScanning = false;
            console.error('Failed to initialize scanner:', error);
            addLog(`❌ Error: ${error.message}`, 'error');
            addLog(`System Error: ${error.message}`, 'error', 'build');
        }
    }

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected');
    });
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    addLog(`❌ Critical Error: ${error.message}`, 'error', 'build');
    shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    addLog(`❌ Unhandled Rejection: ${reason}`, 'error', 'build');
});

// Graceful shutdown
async function shutdown() {
    console.log('🔄 Initiating graceful shutdown...');
    addLog('🔄 System shutting down...', 'system', 'build');
    
    io.emit('server_shutdown', {
        message: 'Server is shutting down',
        timestamp: new Date().toISOString()
    });

    io.close(() => {
        console.log('✅ Socket.IO server closed');
    });

    http.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('⚠️ Force shutdown after timeout');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    const startupMessage = `
🌐 Server initialized:
   - Port: ${PORT}
   - Environment: ${process.env.NODE_ENV || 'development'}
   - Reply Limit: ${REPLY_LIMIT} per ${REPLY_WINDOW/1000}s
   - Scan Interval: ${SCAN_INTERVAL/1000}s
    `;
    console.log(startupMessage);
    addLog(startupMessage, 'system', 'build');
}); 