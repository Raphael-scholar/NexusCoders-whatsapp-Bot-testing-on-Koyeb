const { getCommands } = require('./commandHandler');
const config = require('../config');

const cooldowns = new Map();

const messageHandler = async (sock, msg) => {
    try {
        const content = msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text || 
                       msg.message?.imageMessage?.caption || 
                       msg.message?.videoMessage?.caption;

        if (!content || !content.startsWith(config.prefix)) return;

        const args = content.slice(config.prefix.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();
        const command = getCommands().get(cmdName);

        if (!command) return;

        const sender = msg.key.remoteJid;
        const isGroup = sender.endsWith('@g.us');
        const isOwner = sender === config.ownerNumber + '@s.whatsapp.net';

        if (command.ownerOnly && !isOwner) {
            await sock.sendMessage(sender, { text: config.messages.ownerOnly });
            return;
        }

        if (command.groupOnly && !isGroup) {
            await sock.sendMessage(sender, { text: config.messages.groupOnly });
            return;
        }

        if (command.privateOnly && isGroup) {
            await sock.sendMessage(sender, { text: config.messages.privateOnly });
            return;
        }

        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Map());
        }

        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;
        const now = Date.now();

        if (timestamps.has(sender)) {
            const expirationTime = timestamps.get(sender) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                const message = config.messages.cooldown.replace('{time}', timeLeft.toFixed(1));
                await sock.sendMessage(sender, { text: message });
                return;
            }
        }

        timestamps.set(sender, now);
        setTimeout(() => timestamps.delete(sender), cooldownAmount);

        await command.execute(sock, msg, args);
    } catch (error) {
        await sock.sendMessage(msg.key.remoteJid, { text: config.messages.error });
    }
};

module.exports = messageHandler;
