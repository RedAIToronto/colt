const fs = require('fs').promises;
const TwitterClient = require('./TwitterClient');
const AIAnalyzer = require('./AIAnalyzer');
const server = require('./server');

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
        console.log(`📱 New tweet found from @${data.author}`);
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
    const batchSize = 30;
    let cursor = undefined;
    let totalTweets = 0;
    let retryCount = 0;
    const MAX_RETRIES = 5;

    while (true) {
        try {
            if (!twitter.isInitialized()) {
                await logToFile('Initializing Twitter client...', 'system');
                await twitter.initialize();
                await logToFile('Successfully logged in to Twitter', 'system');
            }

            const searchResults = await twitter.fetchSearchTweets(
                'Solana OR $SOL OR #Solana OR #SOL',
                batchSize,
                'Latest',
                cursor
            );

            // Reset retry count on successful fetch
            retryCount = 0;

            // Emit search results to connected clients
            if (io) {
                io.emit('search_results', {
                    results: searchResults?.tweets || [],
                    timestamp: new Date().toISOString(),
                    total: totalTweets
                });
            }

            if (!searchResults?.tweets?.length) {
                await logToFile('No new tweets found. Waiting before next scan...', 'system');
                await sleep(server.SCAN_INTERVAL);
                continue;
            }

            totalTweets += searchResults.tweets.length;
            
            // Emit real-time updates to connected clients
            if (io) {
                io.emit('status', {
                    totalTweets,
                    lastUpdate: new Date().toISOString(),
                    status: 'Processing tweets'
                });
            }

            // Process tweets with AI
            const aiAnalysis = await aiAnalyzer.analyzeTweets(searchResults.tweets);
            
            if (aiAnalysis?.length) {
                for (const analysis of aiAnalysis) {
                    // Log the analysis
                    await logToFile({
                        type: 'analysis',
                        tweet_id: analysis.tweet_id,
                        author: analysis.author,
                        tweet_text: analysis.tweet_text,
                        sentiment: analysis.sentiment_score,
                        reply: analysis.reply,
                        content: analysis.content,
                        spam: analysis.spam
                    });

                    // Handle replies if needed and allowed
                    if (analysis.reply && !analysis.spam && analysis.content && server.canReply()) {
                        try {
                            const replyResult = await twitter.replyToTweet(analysis.content, analysis.tweet_id);
                            
                            if (replyResult) {
                                await logToFile(`Reply sent to @${analysis.author}`, 'system');
                                server.trackReply();
                                await sleep(server.REPLY_WINDOW / server.REPLY_LIMIT);
                            }
                        } catch (error) {
                            await logToFile(`Failed to send reply: ${error.message}`, 'error');
                        }
                    }
                }
            }

            cursor = searchResults.next;
            
            // Emit batch completion status
            if (io) {
                io.emit('batch_complete', {
                    processed: searchResults.tweets.length,
                    total: totalTweets,
                    timestamp: new Date().toISOString()
                });
            }

            await sleep(server.SCAN_INTERVAL);

        } catch (error) {
            retryCount++;
            const errorMessage = `Error in tweet scanner: ${error.message}`;
            await logToFile(errorMessage, 'error');
            
            // Emit error to connected clients
            if (io) {
                io.emit('scanner_error', {
                    message: errorMessage,
                    retry: retryCount,
                    timestamp: new Date().toISOString()
                });
            }

            if (retryCount >= MAX_RETRIES) {
                await logToFile('Max retries reached. Restarting client...', 'system');
                await twitter.initialize(true); // Force re-initialization
                retryCount = 0;
            }

            const waitTime = Math.min(1000 * Math.pow(2, retryCount), 60000);
            await logToFile(`Waiting ${waitTime/1000} seconds before retry...`, 'system');
            await sleep(waitTime);
        }
    }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
    await logToFile('Gracefully shutting down...', 'system');
    process.exit(0);
});

process.on('unhandledRejection', async (error) => {
    await logToFile(`Unhandled rejection: ${error.message}`, 'error');
});

module.exports = { searchXRPTweets }; 