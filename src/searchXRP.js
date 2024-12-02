const fs = require('fs').promises;
const TwitterClient = require('./TwitterClient');
const AIAnalyzer = require('./AIAnalyzer');

// Constants
const SCAN_INTERVAL = 120000; // 2 minutes

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function logToFile(data, type = 'tweet') {
    const timestamp = new Date().toISOString();
    let logEntry;
    
    if (type === 'system') {
        logEntry = `[${timestamp}] SYSTEM: ${data}\n`;
        console.log(`🔧 ${data}`);
    } else if (type === 'error') {
        logEntry = `[${timestamp}] ERROR: ${data}\n`;
        console.error(`❌ ${data}`);
    } else {
        logEntry = `[${timestamp}] TWEET:\n${JSON.stringify(data, null, 2)}\n\n`;
    }
    
    try {
        await fs.appendFile('log.txt', logEntry);
    } catch (error) {
        console.error('Failed to write to log file:', error);
    }
}

async function searchXRPTweets(io) {
    const twitter = new TwitterClient();
    const aiAnalyzer = new AIAnalyzer();
    let retryCount = 0;
    const MAX_RETRIES = 5;

    while (true) {
        try {
            if (!twitter.isInitialized()) {
                await logToFile('Initializing Twitter client...', 'system');
                await twitter.initialize();
            }

            const searchResults = await twitter.fetchSearchTweets();
            retryCount = 0;

            if (searchResults?.tweets?.length) {
                const aiAnalysis = await aiAnalyzer.analyzeTweets(searchResults.tweets);
                
                if (aiAnalysis?.length) {
                    for (const analysis of aiAnalysis) {
                        if (analysis.reply && !analysis.spam && analysis.content) {
                            try {
                                const replyResult = await twitter.replyToTweet(analysis.content, analysis.tweet_id);
                                if (replyResult) {
                                    await logToFile(`Reply sent to @${analysis.author}`, 'system');
                                    await sleep(30000); // Wait 30s between replies
                                }
                            } catch (error) {
                                await logToFile(`Failed to send reply: ${error.message}`, 'error');
                            }
                        }
                    }
                }
            }

            await sleep(SCAN_INTERVAL);

        } catch (error) {
            retryCount++;
            const errorMessage = `Error in tweet scanner: ${error.message}`;
            await logToFile(errorMessage, 'error');
            
            if (io) {
                io.emit('scanner_error', {
                    message: errorMessage,
                    retry: retryCount,
                    timestamp: new Date().toISOString()
                });
            }

            if (retryCount >= MAX_RETRIES) {
                await logToFile('Max retries reached. Restarting client...', 'system');
                await twitter.initialize(true);
                retryCount = 0;
            }

            const waitTime = Math.min(1000 * Math.pow(2, retryCount), 60000);
            await sleep(waitTime);
        }
    }
}

process.on('SIGINT', async () => {
    await logToFile('Gracefully shutting down...', 'system');
    process.exit(0);
});

process.on('unhandledRejection', async (error) => {
    await logToFile(`Unhandled rejection: ${error.message}`, 'error');
});

module.exports = { searchXRPTweets }; 