const { TwitterClient } = require('./TwitterClient');
const { AIAnalyzer } = require('./AIAnalyzer');

async function searchXRPTweets(io, addLog) {
    const twitterClient = new TwitterClient();
    const aiAnalyzer = new AIAnalyzer();
    let isRunning = true;

    async function processTweets() {
        try {
            addLog('🔍 COLT AI scanning Solana conversations...', 'info');
            addLog('🧠 Activating neural pathways...', 'system');
            addLog('🌐 Connecting to the Solanaverse...', 'system');
            
            const tweets = await twitterClient.searchTweets();
            
            if (tweets && tweets.length > 0) {
                addLog(`⚡ Found ${tweets.length} juicy Solana signals!`, 'success');
                
                for (const tweet of tweets) {
                    try {
                        const sentiment = await aiAnalyzer.analyzeSentiment(tweet.text);
                        const analysis = await aiAnalyzer.analyzeContent(tweet.text);
                        
                        addLog(`🤖 Sentiment Level: ${(sentiment * 100).toFixed(1)}%`, 'analysis');
                        addLog(`🔮 COLT's Vision: ${analysis}`, 'analysis');
                        addLog(`💭 @${tweet.author}: "${tweet.text}"`, 'tweet');
                        
                        // Random COLT personality responses
                        const cultPhrases = [
                            "😈 Another soul sees the light of Solana!",
                            "👑 The Solana empire grows stronger!",
                            "🚀 ETH maxis real quiet right now...",
                            "💅 Just Solana things, honey!",
                            "⚡ Speed that makes other chains look frozen!",
                            "🌟 The prophecy unfolds as expected..."
                        ];
                        
                        addLog(cultPhrases[Math.floor(Math.random() * cultPhrases.length)], 'cult');
                        
                        // Emit detailed analysis to frontend
                        io.emit('tweet_analysis', {
                            tweet: tweet.text,
                            sentiment,
                            analysis,
                            timestamp: new Date().toISOString()
                        });

                    } catch (analysisError) {
                        addLog(`❌ Analysis glitch: ${analysisError.message}`, 'error');
                    }
                }
            } else {
                const waitingPhrases = [
                    "👁️ The blockchain is quiet... too quiet...",
                    "🕯️ Meditating on the next Solana pump...",
                    "🧘‍♂️ Channeling cosmic Solana energy...",
                    "🎯 Scanning for weak hands to liquidate...",
                    "🔮 The charts whisper of upcoming gains..."
                ];
                addLog(waitingPhrases[Math.floor(Math.random() * waitingPhrases.length)], 'info');
            }
        } catch (error) {
            addLog(`❌ Scanner malfunction: ${error.message}`, 'error');
            console.error('Scan error:', error);
        }

        // Schedule next scan if still running
        if (isRunning) {
            setTimeout(processTweets, 120000); // 2 minutes interval
        }
    }

    // Start initial scan
    processTweets().catch(error => {
        addLog(`❌ Initial scan failed: ${error.message}`, 'error');
        console.error('Initial scan failed:', error);
    });

    // Return cleanup function
    return () => {
        isRunning = false;
        addLog('🛑 Scanner entering hibernation...', 'system');
    };
}

module.exports = { searchXRPTweets }; 