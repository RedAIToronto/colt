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
        
        // Initialize scraper in constructor
        this.scraper = new Scraper({
            username: process.env.TWITTER_USERNAME,
            password: process.env.TWITTER_PASSWORD,
            debug: true,
            retry: {
                retries: 3,
                minTimeout: 2000
            }
        });
        
        this.initialized = false;
        this.processedTweets = new Set();
    }

    isInitialized() {
        return this.initialized;
    }

    async initialize(force = false) {
        if (this.initialized && !force) {
            return;
        }

        try {
            // Check environment variables
            const envCheck = {
                hasUsername: !!process.env.TWITTER_USERNAME,
                hasPassword: !!process.env.TWITTER_PASSWORD
            };
            console.log('Environment check:', envCheck);

            if (!envCheck.hasUsername || !envCheck.hasPassword) {
                throw new Error('Missing Twitter credentials in environment variables');
            }

            // Login to Twitter
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
            this.initialized = true;

        } catch (error) {
            this.initialized = false;
            throw new Error(`Failed to initialize Twitter client: ${error.message}`);
        }
    }

    hasTweetBeenProcessed(tweetId) {
        return this.processedTweets.has(tweetId);
    }

    markTweetAsProcessed(tweetId) {
        this.processedTweets.add(tweetId);
    }

    async fetchSearchTweets(query, count = 30, mode = 'Latest', cursor = undefined) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        try {
            return await this.scraper.fetchSearchTweets(query, count, mode, cursor);
        } catch (error) {
            console.error('Error fetching tweets:', error);
            throw error;
        }
    }

    async replyToTweet(replyText, tweetId) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const result = await this.scraper.sendTweet(replyText, tweetId);
            if (result) {
                this.markTweetAsProcessed(tweetId);
            }
            return result;
        } catch (error) {
            console.error(`Failed to reply to tweet ${tweetId}:`, error);
            throw error;
        }
    }
}

module.exports = TwitterClient; 