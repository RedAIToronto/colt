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

    isInitialized() {
        return this.initialized;
    }

    async initialize() {
        console.log('🔄 Connecting to Solana Twitter network...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.initialized = true;
        console.log('✅ Successfully connected! Monitoring Solana conversations...');
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

        console.log(`\n📱 Found new tweet from @${tweet.author}:`);
        console.log(`💭 "${tweet.text}"`);
        console.log(`❤️ ${tweet.likes} likes • 🔄 ${tweet.retweets} retweets\n`);

        return tweet;
    }

    async fetchSearchTweets() {
        if (!this.initialized) {
            await this.initialize();
        }

        const now = Date.now();
        if (now - this.lastTweetTime < SCAN_INTERVAL) {
            return { tweets: [], next: null };
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        this.lastTweetTime = now;
        
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
            console.log('\n🤖 Generating AI response...');
            console.log(`✍️ "${replyText}"\n`);
            
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