const config = require('../config');
const logger = require('../utils/logger');
const { checkPermission } = require('../utils/permissions');

const messageHandler = async (sock, msg) => {
    try {
        const content = msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text || 
                       msg.message?.imageMessage?.caption || 
                       msg.message?.videoMessage?.caption;
                       
        if (!content) return;
        
        if (!content.startsWith(config.prefix)) return;
        
        const args = content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = sock.commands.get(commandName);
        
        if (!command) return;
        
        const hasPermission = await checkPermission(msg.key.remoteJid, command.permission || 'USE_COMMANDS');
        
        if (!hasPermission) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ You do not have permission to use this command.' 
            });
            return;
        }
        
        await command.execute(sock, msg, args);
        
    } catch (error) {
        logger.error('Message handler error:', error);
        await sock.sendMessage(msg.key.remoteJid, { 
            text: '❌ An error occurred while processing your command.' 
        });
    }
};

module.exports = messageHandler;
