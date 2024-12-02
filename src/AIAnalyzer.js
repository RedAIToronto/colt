class AIAnalyzer {
    constructor() {
        this.initialized = true;
        console.log('🧠 AI Analyzer initialized in simulation mode');
        
        // Predefined analysis responses for more realistic simulation
        this.sentimentPatterns = [
            { keywords: ['bullish', 'breakout', 'support', 'strong'], score: 0.8 },
            { keywords: ['sec', 'case', 'legal', 'filing'], score: 0.6 },
            { keywords: ['bearish', 'resistance', 'down'], score: 0.3 },
            { keywords: ['scam', 'dump', 'crash'], score: 0.1 }
        ];

        this.analysisTemplates = [
            "Market sentiment appears {sentiment}. {reason}",
            "Technical indicators suggest {sentiment} momentum. {reason}",
            "Community sentiment is {sentiment} based on recent activity. {reason}",
            "Analysis indicates {sentiment} market conditions. {reason}"
        ];

        this.reasonTemplates = {
            positive: [
                "Strong support levels are holding.",
                "Increased institutional interest observed.",
                "Technical indicators align with bullish thesis.",
                "Growing adoption metrics support this view."
            ],
            neutral: [
                "Mixed signals in current market conditions.",
                "Waiting for more clear directional indicators.",
                "Consolidation phase may continue.",
                "Need more data for definitive analysis."
            ],
            negative: [
                "Resistance levels proving difficult to break.",
                "Market uncertainty affecting sentiment.",
                "Volume indicators showing weakness.",
                "Technical patterns suggest caution."
            ]
        };
    }

    analyzeSentiment(text) {
        // Calculate sentiment based on keyword matching
        let sentimentScore = 0.5; // Default neutral sentiment
        let matchCount = 0;

        this.sentimentPatterns.forEach(pattern => {
            pattern.keywords.forEach(keyword => {
                if (text.toLowerCase().includes(keyword.toLowerCase())) {
                    sentimentScore = (sentimentScore + pattern.score) / 2;
                    matchCount++;
                }
            });
        });

        // Add some randomness for more realistic results
        const randomFactor = (Math.random() * 0.2) - 0.1; // ±0.1
        sentimentScore = Math.max(0, Math.min(1, sentimentScore + randomFactor));

        return sentimentScore;
    }

    analyzeContent(text) {
        const sentiment = this.analyzeSentiment(text);
        let sentimentCategory;
        let reasonList;

        if (sentiment > 0.6) {
            sentimentCategory = "positive";
            reasonList = this.reasonTemplates.positive;
        } else if (sentiment < 0.4) {
            sentimentCategory = "negative";
            reasonList = this.reasonTemplates.negative;
        } else {
            sentimentCategory = "neutral";
            reasonList = this.reasonTemplates.neutral;
        }

        const template = this.analysisTemplates[Math.floor(Math.random() * this.analysisTemplates.length)];
        const reason = reasonList[Math.floor(Math.random() * reasonList.length)];

        return template
            .replace('{sentiment}', sentimentCategory)
            .replace('{reason}', reason);
    }
}

module.exports = { AIAnalyzer }; 