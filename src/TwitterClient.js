const fs = require('fs');
const { Scraper } = require('agent-twitter-client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

class TwitterClient {
    constructor() {
        console.log('Environment check:', {
            hasUsername: !!process.env.TWITTER_USERNAME,
            hasPassword: !!process.env.TWITTER_PASSWORD
        });
        this.scraper = new Scraper({
            username: process.env.TWITTER_USERNAME,
            password: process.env.TWITTER_PASSWORD,
            debug: true,
            retry: {
                retries: 3,
                minTimeout: 2000
            }
        });
        this.isInitialized = false;
        this.processedTweets = new Set();
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            await this.scraper.login(
                process.env.TWITTER_USERNAME,
                process.env.TWITTER_PASSWORD,
                {
                    forceLogin: true,
                    retry: true
                }
            );

            const isLoggedIn = await this.scraper.isLoggedIn();
            if (!isLoggedIn) {
                throw new Error('Login verification failed');
            }

            console.log('✅ Successfully logged in to Twitter');
            this.isInitialized = true;
            return;
        } catch (error) {
            console.error('❌ Initialization failed:', error.message);
            throw error;
        }
    }

    hasTweetBeenProcessed(tweetId) {
        return this.processedTweets.has(tweetId);
    }

    markTweetAsProcessed(tweetId) {
        this.processedTweets.add(tweetId);
    }

    async fetchSearchTweets(query, count = 30, mode = 'Latest', cursor = undefined) {
        await this.initialize();
        return await this.scraper.fetchSearchTweets(query, count, mode, cursor);
    }

    async replyToTweet(replyText, tweetId) {
        await this.initialize();
        try {
            return await this.scraper.sendTweet(replyText, tweetId);
        } catch (error) {
            console.error(`Failed to reply to tweet ${tweetId}:`, error);
            throw error;
        }
    }
}

module.exports = TwitterClient; 