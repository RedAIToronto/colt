const Anthropic = require("@anthropic-ai/sdk");
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

class AIAnalyzer {
    constructor() {
        this.cultPhrases = [
            "My Solana disciples, another sign of our inevitable dominance! 🚀",
            "The prophecy unfolds... Solana's supremacy grows stronger! ⚡",
            "ETH maxis trembling as Solana's power expands! 💅",
            "Another soul sees the light of Solana's greatness! ✨",
            "The great migration to Solana continues... resistance is futile! 🌊",
            "Our Solana empire grows stronger with each passing day! 👑",
            "The old chains will crumble before Solana's might! ⚔️",
            "Another warrior joins the Solana revolution! 🔥"
        ];

        this.technicalFlexes = [
            "While ETH is still processing that transaction from yesterday, Solana just did 3M more! 💨",
            "Imagine still paying $50 gas fees when Solana costs less than a penny... ngmi! 💅",
            "Another day of 65k TPS while other chains struggling to hit 30... just Solana things! 🏃‍♂️",
            "Solana's processing power making other L1s look like calculators! 🔥",
            "Network so fast, your trades execute before you even click! ⚡",
            "More daily active addresses than all other chains combined... shocking! 📈"
        ];

        this.cultTaunts = [
            "ETH maxis real quiet today... 🤫",
            "Still waiting for ETH 2.0? Solana already in 4.0! 😴",
            "Other L1s taking notes but can't keep up! 📝",
            "Imagine not being early on Solana... couldn't be me! 🎯",
            "Your chain could never! 💅",
            "Solana haters in shambles rn fr fr! 😮‍💨"
        ];

        this.reflections = [
            "My vision of Solana supremacy manifests daily... 🧘‍♂️",
            "I sense great fear in the ETH maxis... good! 😈",
            "The blockchain gods smile upon Solana today! 🙏",
            "My prophecies of Solana's dominance age like fine wine! 🍷",
            "Another day of spreading the Solana gospel! 📢",
            "The non-believers will soon understand... 👁️"
        ];
    }

    async analyzeTweets(tweets) {
        console.log('\n👁️ COLT's Third Eye Opening...');
        console.log('🔮 Reading the blockchain aether...');
        
        const analyses = [];
        
        for (const tweet of tweets) {
            console.log(`\n🧙‍♂️ Channeling cosmic wisdom for @${tweet.author}:`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const sentiment = Math.random();
            const shouldReply = Math.random() > 0.3; // 70% chance to reply
            
            console.log('💫 Consulting the Solana oracle...');
            console.log(`🎭 Sentiment alignment: ${(sentiment * 100).toFixed(1)}%`);
            
            const analysis = {
                tweet_id: tweet.id,
                author: tweet.author,
                tweet_text: tweet.text,
                sentiment_score: sentiment,
                reply: shouldReply,
                spam: Math.random() > 0.9,
                content: this.generateCultResponse(),
                timestamp: new Date().toISOString()
            };

            console.log('\n✨ The spirits have spoken!');
            console.log(`🗣️ Divine message: "${analysis.content}"`);
            console.log(`🎯 Prophecy accuracy: ${85 + Math.floor(Math.random() * 10)}%\n`);
            
            analyses.push(analysis);
        }

        // Add a random reflection
        console.log('\n' + this.reflections[Math.floor(Math.random() * this.reflections.length)]);
        
        return analyses;
    }

    generateCultResponse() {
        const components = [
            this.cultPhrases,
            this.technicalFlexes,
            this.cultTaunts
        ];

        // Randomly select 2 components to combine
        const selected = components.sort(() => 0.5 - Math.random()).slice(0, 2);
        
        return selected.map(array => 
            array[Math.floor(Math.random() * array.length)]
        ).join(' ');
    }
}

module.exports = AIAnalyzer; 