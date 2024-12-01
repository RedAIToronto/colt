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
    
    await fs.appendFile('log.txt', logEntry);
}

async function searchXRPTweets(io) {
    const twitter = new TwitterClient();
    const aiAnalyzer = new AIAnalyzer();
    const batchSize = 30;
    let cursor = undefined;
    let totalTweets = 0;

    try {
        await logToFile('Initializing Twitter client...', 'system');
        await twitter.initialize();
        await logToFile('Successfully logged in to Twitter', 'system');
        
        while (true) {
            await logToFile(`Fetching batch of ${batchSize} tweets about XRP...`, 'system');
            
            const searchResults = await twitter.fetchSearchTweets(
                'Solana OR $SOL OR #Solana OR #SOL',
                batchSize,
                'Latest',
                cursor
            );

            if (!searchResults || !searchResults.tweets || searchResults.tweets.length === 0) {
                await logToFile('No tweets found in this batch. Waiting before retry...', 'system');
                await sleep(30000);
                continue;
            }

            // Process tweets with AI
            console.log('🤖 Sending tweets to AI for analysis...');
            const aiAnalysis = await aiAnalyzer.analyzeTweets(searchResults.tweets);
            if (aiAnalysis) {
                console.log(`✨ Processing ${aiAnalysis.length} AI analyses...`);
                
                // Track replies for this batch
                const repliesNeeded = aiAnalysis.filter(a => a.reply && a.content);
                
                if (repliesNeeded.length > 0) {
                    console.log('\n📢 Replies needed for this batch:');
                    console.log('=====================================');
                    
                    for (const analysis of repliesNeeded) {
                        console.log(`\n🎯 Target Tweet: @${analysis.author}`);
                        console.log(`💭 Original: ${analysis.tweet_text}`);
                        console.log(`✍️ Our Reply: ${analysis.content}`);
                        console.log('-------------------------------------');
                    }
                }

                // Process all analyses
                for (const analysis of aiAnalysis) {
                    await logToFile({
                        type: 'analysis',
                        tweet_id: analysis.tweet_id,
                        author: analysis.author,
                        tweet_text: analysis.tweet_text,
                        url: analysis.tweet_url,
                        sentiment: analysis.sentiment_score,
                        reply: analysis.reply,
                        content: analysis.content,
                        spam: analysis.spam
                    });

                    if (analysis.author) {
                        console.log(`📱 Analyzed tweet from @${analysis.author}: ${analysis.sentiment_score > 0 ? '😊' : '😐'}`);
                    }

                    // Check if we can reply before attempting
                    if (analysis.reply && !analysis.spam && analysis.content && server.canReply()) {
                        try {
                            console.log('\n🎯 Found tweet to reply to:');
                            console.log(`👤 Author: @${analysis.author}`);
                            console.log(`💭 Original: ${analysis.tweet_text}`);
                            console.log(`✍️ Our reply: ${analysis.content}`);
                            console.log('-------------------------------------');

                            // Actually send the reply
                            console.log(`🚀 Sending reply to tweet ID: ${analysis.tweet_id}`);
                            const replyResult = await twitter.replyToTweet(analysis.content, analysis.tweet_id);
                            
                            if (replyResult) {
                                console.log('✅ Reply posted successfully!');
                                await logToFile(`Successfully replied to @${analysis.author}'s tweet (ID: ${analysis.tweet_id})`, 'system');
                                
                                // Log the reply to a separate file for tracking
                                await fs.appendFile('replies_sent.txt', 
                                    `[${new Date().toISOString()}]\n` +
                                    `Replied to: @${analysis.author}\n` +
                                    `Tweet: ${analysis.tweet_text}\n` +
                                    `Our reply: ${analysis.content}\n` +
                                    `Tweet ID: ${analysis.tweet_id}\n` +
                                    `URL: ${analysis.tweet_url}\n` +
                                    `=====================================\n\n`
                                );
                                
                                // Wait between replies to avoid rate limits
                                console.log('⏳ Waiting 5 minutes before next action...');
                                server.trackReply();
                                await sleep(server.REPLY_WAIT);
                            }
                        } catch (error) {
                            console.error(`❌ Failed to reply to tweet:`, error);
                            await logToFile(`Failed to reply to tweet ${analysis.tweet_id}: ${error.message}`, 'error');
                        }
                    }
                }
            } else {
                console.warn('⚠️ AI analysis returned no results');
            }

            cursor = searchResults.next;
            await logToFile(
                `Batch complete. Total tweets collected: ${totalTweets}. Waiting 30 seconds...`,
                'system'
            );
            
            await sleep(server.SCAN_INTERVAL);

            if (io) {
                io.emit('log', searchResults);
            }
        }
    } catch (error) {
        const errorMessage = `Error searching tweets: ${error.message}`;
        await logToFile(errorMessage, 'error');
        
        if (error.message.includes('Login failed')) {
            await logToFile('Login failed. Please check your credentials in .env file', 'error');
            process.exit(1);
        }
        
        await logToFile('Waiting 60 seconds before retrying...', 'system');
        await sleep(60000);
        searchXRPTweets(io);
    }

    // Add socket.io emission for logs
    if (io) {
        io.emit('log', data);
    }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
    await logToFile('Script terminated by user. Shutting down...', 'system');
    process.exit(0);
});

// Just export the function
module.exports = { searchXRPTweets }; 