const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

class TwitterClient {
    constructor() {
        this.initialized = false;
        this.processedTweets = new Set();
        this.tweetId = 1000;
    }

    isInitialized() {
        return this.initialized;
    }

    async initialize() {
        console.log('🔄 Simulating Twitter login...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.initialized = true;
        console.log('✅ Successfully connected to Twitter (Simulated)');
        return true;
    }

    generateFakeTweet() {
        const authors = ['crypto_whale', 'SOL_trader', 'blockchain_guru', 'DeFi_master'];
        const contents = [
            'Solana looking bullish today! 🚀 #SOL',
            'Just loaded up on more $SOL, the tech is unmatched! 💎',
            'Solana ecosystem growing fast! New ATH soon? 📈',
            'DeFi on Solana is the future! Gas fees so low 🔥'
        ];
        
        this.tweetId++;
        return {
            id: this.tweetId,
            author: authors[Math.floor(Math.random() * authors.length)],
            text: contents[Math.floor(Math.random() * contents.length)],
            timestamp: new Date().toISOString(),
            likes: Math.floor(Math.random() * 1000),
            retweets: Math.floor(Math.random() * 500)
        };
    }

    async fetchSearchTweets() {
        if (!this.initialized) {
            await this.initialize();
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const tweets = [];
        const numTweets = Math.floor(Math.random() * 3) + 1; // 1-3 tweets per batch
        
        for (let i = 0; i < numTweets; i++) {
            tweets.push(this.generateFakeTweet());
        }

        return {
            tweets,
            next: Math.random() > 0.7 ? this.tweetId : null // 30% chance of having next page
        };
    }

    async replyToTweet(replyText, tweetId) {
        if (!this.initialized) {
            await this.initialize();
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log(`🤖 Simulated reply to tweet ${tweetId}:`, replyText);
        
        if (!this.processedTweets.has(tweetId)) {
            this.processedTweets.add(tweetId);
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