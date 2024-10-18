const config = require('../config');
const { User } = require('../utils/database');
const { executeCommand } = require('./commandHandler');
const { processMessage } = require('../utils/messageProcessor');
const logger = require('../utils/logger');

async function messageHandler(sock, msg) {
    const content = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text || 
                   msg.message?.imageMessage?.caption || 
                   msg.message?.videoMessage?.caption || '';
                   
    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith('@g.us');
    const groupMetadata = isGroup ? await sock.groupMetadata(sender) : {};
    const pushName = msg.pushName || 'User';
    
    let user = await User.findOne({ phoneNumber: sender });
    if (!user) {
        user = await User.create({ phoneNumber: sender });
    }

    const messageInfo = {
        sock,
        msg,
        sender,
        content,
        isGroup,
        groupMetadata,
        pushName,
        user
    };

    if (!content) return;

    try {
        if (content.startsWith(config.prefix)) {
            const args = content.slice(config.prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();
            await executeCommand(messageInfo, command, args);
        } else {
            await processMessage(messageInfo);
        }
    } catch (error) {
        logger.error('Message handling error:', error);
        await sock.sendMessage(sender, { text: config.messages.error });
    }
}

module.exports = messageHandler;
