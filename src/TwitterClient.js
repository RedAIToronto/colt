const fs = require('fs');
const { Scraper } = require('agent-twitter-client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

class TwitterClient {
    constructor() {
        const envCheck = {
            hasUsername: !!process.env.TWITTER_USERNAME,
            hasPassword: !!process.env.TWITTER_PASSWORD
        };
        console.log('Environment check:', envCheck);
        
        this.scraper = new Scraper({
            username: process.env.TWITTER_USERNAME,
            password: process.env.TWITTER_PASSWORD,
            debug: false,  // Set to false to reduce noise
            retry: {
                retries: 3,
                minTimeout: 2000
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
            // Add delay before login attempt
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Basic validation
            if (!process.env.TWITTER_USERNAME || !process.env.TWITTER_PASSWORD) {
                throw new Error('Missing Twitter credentials');
            }

            // Attempt login with retry
            let loginAttempts = 0;
            const maxAttempts = 3;
            
            while (loginAttempts < maxAttempts) {
                try {
                    await this.scraper.login();
                    break;
                } catch (error) {
                    loginAttempts++;
                    if (loginAttempts === maxAttempts) {
                        throw error;
                    }
                    await new Promise(resolve => setTimeout(resolve, 2000 * loginAttempts));
                }
            }

            this.initialized = true;
            console.log('✅ Successfully logged in to Twitter');

        } catch (error) {
            this.initialized = false;
            console.error('❌ Login failed:', error);
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    async fetchSearchTweets(query, count = 30, mode = 'Latest', cursor = undefined) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        try {
            const searchParams = {
                query,
                count,
                mode,
                cursor
            };
            
            return await this.scraper.fetchSearchTweets(searchParams);
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
            const result = await this.scraper.sendTweet({
                text: replyText,
                reply_to: tweetId
            });
            
            if (result) {
                this.markTweetAsProcessed(tweetId);
            }
            return result;
        } catch (error) {
            console.error(`Failed to reply to tweet ${tweetId}:`, error);
            throw error;
        }
    }

    hasTweetBeenProcessed(tweetId) {
        return this.processedTweets.has(tweetId);
    }

    markTweetAsProcessed(tweetId) {
        this.processedTweets.add(tweetId);
    }
}

module.exports = TwitterClient; 