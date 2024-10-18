const config = require('../config');

async function checkPermissions(messageInfo, command) {
    const { sender, isGroup, groupMetadata, user } = messageInfo;

    if (command.ownerOnly && sender !== config.ownerNumber + '@s.whatsapp.net') {
        return { granted: false, message: config.messages.ownerOnly };
    }

    if (command.premium && !user.premium) {
        return { granted: false, message: config.messages.premiumOnly };
    }

    if (command.groupOnly && !isGroup) {
        return { granted: false, message: config.messages.groupOnly };
    }

    if (command.privateOnly && isGroup) {
        return { granted: false, message: config.messages.privateOnly };
    }

    if (command.adminOnly && isGroup) {
        const isAdmin = groupMetadata.participants.some(
            p => p.id === sender && ['admin', 'superadmin'].includes(p.admin)
        );
        if (!isAdmin) {
            return { granted: false, message: config.messages.adminOnly };
        }
    }

    if (command.botAdmin && isGroup) {
        const botId = messageInfo.sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = groupMetadata.participants.some(
            p => p.id === botId && ['admin', 'superadmin'].includes(p.admin)
        );
        if (!isBotAdmin) {
            return { granted: false, message: config.messages.botAdmin };
        }
    }

    if (command.register && !user.registered) {
        return { granted: false, message: config.messages.unreg };
    }

    return { granted: true, message: '' };
}

module.exports = {
    checkPermissions
};
