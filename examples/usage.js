const TwitterClient = require('../src/TwitterClient');

async function example() {
    const twitter = new TwitterClient();

    try {
        // Post a tweet
        await twitter.postTweet("Hello from AI!");

        // Post a tweet with media
        await twitter.postTweet("Check out this image!", [{
            path: './image.jpg',
            type: 'image/jpeg'
        }]);

        // Create a poll
        await twitter.postPoll(
            "What's your favorite programming language?",
            ["JavaScript", "Python", "Java", "Other"],
            60 // Duration in minutes
        );

        // Get latest tweets from a user
        const tweets = await twitter.getLatestTweets('elonmusk', 5);
        console.log('Latest tweets:', tweets);

        // Search tweets
        const searchResults = await twitter.searchTweets('#AI', 10);
        console.log('Search results:', searchResults);

    } catch (error) {
        console.error('Error:', error);
    }
}

example(); 