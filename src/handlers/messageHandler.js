const { searchCommands } = require('./commandHandler');
const { getUserPermissions } = require('../utils/permissions');
const config = require('../config');
const logger = require('../utils/logger');

const messageHandler = async (sock, msg) => {
    try {
        const content = msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text || 
                       msg.message?.imageMessage?.caption || 
                       msg.message?.videoMessage?.caption;

        if (!content || !content.startsWith(config.prefix)) return;

        const args = content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = await searchCommands(commandName);

        if (!command) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ Command not found! Use .help to see available commands.' 
            });
            return;
        }

        const userPermissions = await getUserPermissions(msg.key.participant || msg.key.remoteJid);
        const hasPermission = userPermissions.includes(command.permission);

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
