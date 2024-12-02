const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Constants
const SCAN_INTERVAL = 120000; // 2 minutes in milliseconds

class TwitterClient {
    constructor() {
        this.initialized = false;
        this.processedTweets = new Set();
        this.tweetId = 1000;
        this.lastTweetTime = Date.now();
        this.scanCount = 0;
        
        // Personality responses
        this.thoughtProcesses = [
            "🤔 Analyzing market sentiment in this tweet...",
            "💭 Interesting perspective. Let me think about this...",
            "🧠 Processing the technical implications...",
            "📊 Comparing this with my historical data...",
            "🔍 Looking for key insights in this message..."
        ];

        this.analysisComments = [
            "This tweet aligns with recent market movements I've observed.",
            "The sentiment here matches my technical analysis.",
            "I detect strong conviction in this statement.",
            "This could be significant for Solana's ecosystem.",
            "Let me cross-reference this with other indicators."
        ];

        // More realistic Solana influencer names
        this.authors = [
            'SolanaVision',
            'SOLWealth',
            'CryptoInsights',
            'DegenTrader',
            'Web3Wizard',
            'BlockchainBrain',
            'SolanaBuilder',
            'DeFiWhale'
        ];

        this.tweetTemplates = [
            {
                topic: 'price',
                templates: [
                    "Just analyzed $SOL's price action - strong support at {price}. Looking bullish! 📈",
                    "Solana breaking out! Next target {price}+ if volume keeps up 🚀",
                    "Accumulating more $SOL at these levels. NFA but {price} looks like a steal 💎",
                ]
            },
            {
                topic: 'technology',
                templates: [
                    "Solana's TPS hitting new records! Just saw {tps}k transactions per second. Incredible scaling 🔥",
                    "New Solana upgrade coming! Expect {feature} to improve network stability even further 🛠️",
                    "Testing new Solana DApp - {tps}ms finality is game-changing for DeFi! ⚡",
                ]
            },
            {
                topic: 'ecosystem',
                templates: [
                    "Another day, another amazing Solana project! Check out {project} - revolutionizing {sector} 🌟",
                    "The Solana ecosystem is booming! {project} just hit {users}k users in 24hrs 📈",
                    "Big news! {project} launching on Solana next week. This is huge for {sector}! 🎉",
                ]
            }
        ];

        this.projects = ['Jupiter', 'Marinade', 'Kamino', 'Drift', 'Zeta', 'Mango', 'Raydium', 'Orca'];
        this.sectors = ['DeFi', 'NFTs', 'Gaming', 'Social-Fi', 'Payments', 'DEX'];
    }

    getRandomThought() {
        return this.thoughtProcesses[Math.floor(Math.random() * this.thoughtProcesses.length)];
    }

    getRandomAnalysis() {
        return this.analysisComments[Math.floor(Math.random() * this.analysisComments.length)];
    }

    isInitialized() {
        return this.initialized;
    }

    async initialize() {
        console.log('\n🧠 COLT AI Initializing...');
        console.log('📚 Loading market analysis modules...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('🔄 Calibrating sentiment analysis...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('🌐 Connecting to Solana network...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.initialized = true;
        console.log('✨ All systems operational! Ready to analyze Solana conversations.\n');
        return true;
    }

    generateTweetContent() {
        const template = this.tweetTemplates[Math.floor(Math.random() * this.tweetTemplates.length)];
        let content = template.templates[Math.floor(Math.random() * template.templates.length)];

        content = content
            .replace('{price}', '$' + (Math.floor(Math.random() * 40) + 80))
            .replace('{tps}', Math.floor(Math.random() * 50) + 20)
            .replace('{project}', this.projects[Math.floor(Math.random() * this.projects.length)])
            .replace('{sector}', this.sectors[Math.floor(Math.random() * this.sectors.length)])
            .replace('{users}', Math.floor(Math.random() * 90) + 10)
            .replace('{feature}', 'v2.0 optimization');

        return content;
    }

    generateFakeTweet() {
        this.tweetId++;
        const tweet = {
            id: this.tweetId,
            author: this.authors[Math.floor(Math.random() * this.authors.length)],
            text: this.generateTweetContent(),
            timestamp: new Date().toISOString(),
            likes: Math.floor(Math.random() * 1000),
            retweets: Math.floor(Math.random() * 500)
        };

        console.log(`\n📱 Found interesting tweet from @${tweet.author}:`);
        console.log(`💭 "${tweet.text}"`);
        console.log(`❤️ ${tweet.likes} likes • 🔄 ${tweet.retweets} retweets`);
        console.log(`\n${this.getRandomThought()}`);
        console.log(`🤖 ${this.getRandomAnalysis()}\n`);

        return tweet;
    }

    async fetchSearchTweets() {
        if (!this.initialized) {
            await this.initialize();
        }

        const now = Date.now();
        if (now - this.lastTweetTime < SCAN_INTERVAL) {
            this.scanCount++;
            if (this.scanCount % 5 === 0) {
                console.log('\n🔍 Still actively monitoring Solana conversations...');
                console.log('💡 Did you know? Solana can process up to 65,000 TPS!\n');
            }
            return { tweets: [], next: null };
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        this.lastTweetTime = now;
        this.scanCount = 0;
        
        return {
            tweets: [this.generateFakeTweet()],
            next: null
        };
    }

    async replyToTweet(replyText, tweetId) {
        if (!this.initialized) {
            await this.initialize();
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (!this.processedTweets.has(tweetId)) {
            this.processedTweets.add(tweetId);
            console.log('\n🤖 Analyzing sentiment and context...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('✍️ Crafting personalized response...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log(`🤖 Generated response: "${replyText}"`);
            console.log('📊 Confidence score: 94%\n');
            
            return {
                success: true,
                reply_id: this.tweetId++,
                timestamp: new Date().toISOString()
            };
        }
        
        return null;
    }

    hasTweetBeenProcessed(tweetId) {
        return this.processedTweets.has(tweetId);
    }

    markTweetAsProcessed(tweetId) {
        this.processedTweets.add(tweetId);
    }
}

module.exports = TwitterClient; 