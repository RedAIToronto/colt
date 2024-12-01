require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    twitter: {
        username: process.env.TWITTER_USERNAME,
        password: process.env.TWITTER_PASSWORD,
        email: process.env.TWITTER_EMAIL
    }
};

module.exports = config; 