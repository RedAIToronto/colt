const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Constants for rate limiting
const SCAN_INTERVAL = 30000;  // 30 seconds between scans
const REPLY_LIMIT = 3;        // Max 3 replies
const REPLY_WINDOW = 900000;  // In 15 minutes

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Add health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Track reply count and last reply time
let replyCount = 0;
let lastReplyTime = Date.now();

// Function to check if we can reply
function canReply() {
    const now = Date.now();
    if (now - lastReplyTime > REPLY_WINDOW) {
        replyCount = 0;
        lastReplyTime = now;
        return true;
    }
    return replyCount < REPLY_LIMIT;
}

// Function to track reply
function trackReply() {
    replyCount++;
    lastReplyTime = Date.now();
}

// Socket connection handling
io.on('connection', (socket) => {
    console.log('Web client connected');
    
    // Add error handling for the scanner
    try {
        searchXRPTweets(io).catch(error => {
            console.error('Failed to start scanner:', error);
            socket.emit('error', { message: error.message });
        });
    } catch (error) {
        console.error('Error in socket connection:', error);
        socket.emit('error', { message: error.message });
    }
});

// Export functions for use in searchXRP.js
module.exports = {
    io,
    canReply,
    trackReply,
    SCAN_INTERVAL,
    REPLY_LIMIT,
    REPLY_WINDOW
};

// Start the server
const PORT = process.env.PORT || 3000;
http.listen(PORT, async () => {
    console.log(`🌐 Web interface running on port ${PORT}`);
    
    try {
        // Import and start the XRP scanner after server is ready
        const { searchXRPTweets } = require('./searchXRP');
        console.log('🚀 Starting Solana Tweet Scanner...');
        await searchXRPTweets(io);
    } catch (error) {
        console.error('Failed to start scanner:', error);
        // Log error but don't exit
    }
}); 