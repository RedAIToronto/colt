const Anthropic = require("@anthropic-ai/sdk");
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

class AIAnalyzer {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
    }

    async analyzeTweets(tweets) {
        try {
            console.log('🤖 Starting AI analysis of tweets...');
            
            // Format tweets for AI analysis with proper mapping
            const tweetsData = tweets.map(tweet => ({
                id: tweet.id,
                text: tweet.text?.substring(0, 200), // Limit text length
                author: tweet.username || tweet.author,
                likes: tweet.likes,
                retweets: tweet.retweets,
                url: tweet.permanentUrl || tweet.url
            }));

            console.log(`🔍 Analyzing ${tweetsData.length} tweets...`);

            const msg = await this.anthropic.messages.create({
                model: "claude-3-sonnet-20240229",
                max_tokens: 4000, // Increased token limit
                temperature: 0,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `You are COLT, a savage Solana bull who loves to engage with the crypto community. Your style is casual, uses emojis, and promotes Solana's superiority. You're knowledgeable about all chains but clearly favor SOL.

IMPORTANT: Respond with ONLY a JSON array. Format:
[
    {
        "tweet_id": string,
        "tweet_url": string,
        "reply": boolean,
        "content": string | null,
        "sentiment_score": number,
        "spam": boolean
    }
]

Rules:
1. Mark as spam ONLY if tweet is about fake giveaways/scams
2. Set reply=true for:
   - ETH maxis spreading FUD about Solana
   - Claims about ETH/other L1s being faster/better than SOL
   - Any comparison between other chains and Solana
3. Reply style must be:
   - Use crypto slang (ser, ngmi, wagmi)
   - Lots of emojis 🚀💅
   - Mock other chains' TPS/fees compared to Solana
   - Mention Solana's superior stats (TPS, finality, fees)
   - Keep it fun and trolly

Example replies:
"ser really waiting 15 mins for ETH finality? 💅 Solana already did 1M+ txs while you typed that FUD 🏃‍♂️💨 stay ngmi or join the future fam 🚀"

"ETH $5k? cute. SOL already did 100x while ETH was stuck at 30 TPS 😴 imagine not being on fastest chain in crypto 🤯"

"maxis talking about ETH adoption while Solana processes more daily txs than all other chains combined 📈 numbers don't lie ser 💅✨"

Analyze these tweets (remember to wrap response in []!):

<tweets>
${JSON.stringify(tweetsData, null, 2)}
</tweets>`
                            }
                        ]
                    }
                ]
            });

            console.log('✅ AI analysis completed, parsing response...');
            
            try {
                let response = msg.content[0].text.trim();
                
                // Force response into array format if needed
                if (!response.startsWith('[')) {
                    response = '[' + response + ']';
                }

                console.log('🔍 Processing AI response...');
                
                const parsedResponse = JSON.parse(response);
                
                // Map the analysis back to original tweets
                const enrichedResponse = parsedResponse.map(analysis => {
                    const originalTweet = tweetsData.find(t => t.id === analysis.tweet_id);
                    return {
                        ...analysis,
                        author: originalTweet?.author,
                        tweet_text: originalTweet?.text
                    };
                });

                // Log replies that will be sent
                const repliesNeeded = enrichedResponse.filter(t => t.reply === true && !t.spam && t.content);
                if (repliesNeeded.length > 0) {
                    console.log('\n🎯 Found tweets to reply to:');
                    repliesNeeded.forEach(tweet => {
                        console.log(`\n💬 Replying to @${tweet.author}:`);
                        console.log(`Original: ${tweet.tweet_text}`);
                        console.log(`Our reply: ${tweet.content}`);
                        console.log('-------------------');
                    });
                }

                return enrichedResponse;
            } catch (parseError) {
                console.error('❌ Failed to parse AI response:', parseError.message);
                console.error('Raw AI response:', msg.content[0].text);
                return null;
            }
        } catch (error) {
            console.error('❌ AI Analysis failed:', error);
            if (error.response) {
                console.error('API Error details:', error.response.data);
            }
            return null;
        }
    }
}

module.exports = AIAnalyzer; 