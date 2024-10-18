const moment = require('moment-timezone');

module.exports = {
    name: 'ping',
    aliases: ['p'],
    category: 'general',
    desc: 'Check bot latency',
    cooldown: 5,
    
    async execute(messageInfo, args) {
        const { sock, msg, sender } = messageInfo;
        const start = moment();
        
        await sock.sendMessage(sender, { text: 'Testing ping...' });
        const end = moment();
        
        const latency = end - start;
        const uptime = process.uptime() * 1000;
        
        const response = `🏓 *Pong!*\n\n` +
                        `📊 *Latency:* ${latency}ms\n` +
                        `⏰ *Uptime:* ${formatMs(uptime)}`;
        
        await sock.sendMessage(sender, { text: response });
    }
};

function formatMs(ms) {
    let days = Math.floor(ms / 86400000);
    let hours = Math.floor(ms / 3600000) % 24;
    let minutes = Math.floor(ms / 60000) % 60;
    let seconds = Math.floor(ms / 1000) % 60;
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
