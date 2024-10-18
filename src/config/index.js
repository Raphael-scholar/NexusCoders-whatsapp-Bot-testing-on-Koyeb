const config = {
    botName: process.env.BOT_NAME || 'NexusBot',
    prefix: process.env.PREFIX || '!',
    version: '1.0.0',
    ownerNumber: process.env.OWNER_NUMBER,
    sourceUrl: 'https://github.com/yourusername/your-bot-repo',
    timezone: 'Asia/Jakarta',
    
    database: {
        uri: process.env.MONGODB_URI,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },
    
    messages: {
        cooldown: 'Please wait *{time}* seconds before using this command again.',
        error: 'An error occurred while processing your request.',
        noPermission: 'You do not have permission to use this command.',
        ownerOnly: 'This command can only be used by the bot owner.',
        groupOnly: 'This command can only be used in groups.',
        privateOnly: 'This command can only be used in private chat.',
        adminOnly: 'This command can only be used by group admins.',
        botAdmin: 'Bot must be admin to use this command.',
        unreg: 'Please register first to use this command.',
        nsfw: 'NSFW is not enabled in this group.'
    },
    
    limits: {
        games: 50,
        daily: 100,
        premium: 1000
    },
    
    APIs: {
        openai: process.env.OPENAI_API_KEY,
        removeBg: process.env.REMOVE_BG_KEY
    },
    
    options: {
        public: true,
        autoRead: true,
        selfbot: false,
        restrict: false,
        autoTyping: false,
        autoRecord: false
    },
    
    stickers: {
        quality: 50,
        author: 'NexusBot',
        pack: 'Created by NexusBot'
    }
};

module.exports = config;
